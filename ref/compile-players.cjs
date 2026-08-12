const fs = require('fs');
const path = require('path');
const config = require('../config').default;
const seasonCompetitorPlayers = require(path.join(__dirname,  config.year.toString(), 'competitor_players.json')).season_competitor_players;
const seasonPlayers = require(path.join(__dirname,  config.year.toString(), 'players.json')).season_players;
const lastSeasonLeaders = require(path.join(__dirname, config.reference_year.toString(), 'leaders.json'));
const lastSeasonPlayers = require(path.join(__dirname, config.reference_year.toString(), 'players.json')).season_players;
const understatPlayers = require(path.join(__dirname, config.reference_year.toString(), 'understat_players.json'));

const players = [];

// ~~ Understat has no sportradar IDs, so join by normalized name — accented/diacritic names,
// ~~ hyphens, and dropped/reordered middle names vary between the two sources enough that exact
// ~~ string equality misses often
// ~~ base letters like ß/ø aren't decomposable accents, so NFD stripping alone leaves them mangled
const CHAR_MAP = { 'ß': 'ss', 'ø': 'o', 'đ': 'd', 'ł': 'l', 'ı': 'i', 'æ': 'ae', 'œ': 'oe' };
const normalizeName = (name) => (name || '')
  .toLowerCase()
  .replace(/-/g, ' ')
  .split('').map(ch => CHAR_MAP[ch] || ch).join('')
  .normalize('NFD').replace(/\p{Diacritic}/gu, '')
  .replace(/[^a-z\s]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const tokenSet = (name) => new Set(normalizeName(name).split(' ').filter(Boolean));
const isSubset = (a, b) => [...a].every(t => b.has(t));

const understatByName = new Map();
understatPlayers.forEach(p => understatByName.set(normalizeName(p.player_name), p));

// ~~ known cases where Understat uses a different first name than the one the player is
// ~~ commonly known by (and that sportradar/our roster uses), so no amount of fuzzy token
// ~~ matching can safely bridge the gap without risking a false positive against someone else.
// ~~ keyed by sportradar player id so there's no ambiguity about which real person this is for.
const MANUAL_UNDERSTAT_MATCHES = {
  'sr:player:1601352': 'Mathis Cherki', // Rayan Cherki — Understat lists him under his other first name
  'sr:player:968907': 'Matthew Cash', // Matty Cash
  'sr:player:1634220': 'Yeremi Pino', // Yeremy Pino — spelling variant
  'sr:player:1057153': 'Dan Ballard', // Daniel Ballard
  'sr:player:1973247': 'Joshua King', // Josh King
  'sr:player:2057939': 'Sávio', // Savinho
  'sr:player:1600852': 'Nico González', // Nicolas Gonzalez
  'sr:player:262911': 'Andrew Robertson', // Andy Robertson
  'sr:player:318927': 'Joseph Gomez', // Joe Gomez — disambiguated from Diego Gómez (Brighton) by club
  'sr:player:2269309': 'Alejandro Jiménez', // Alex Jimenez — disambiguated from Raúl Jiménez (Fulham) by club
  'sr:player:1643746': 'Valentino Livramento', // Tino Livramento
  'sr:player:935132': 'Vitalii Mykolenko', // Vitaliy Mykolenko — transliteration variant
};

const understatTokens = understatPlayers.map(p => ({ player: p, tokens: tokenSet(p.player_name) }));

// ~~ how many of OUR OWN roster's display names contain a given token — used to tell a genuine
// ~~ mononym ("Thiago", unique on our roster) apart from a common first name ("Rayan"/"Gabriel",
// ~~ shared by several unrelated players) when only one side of a subset match has a single token
const rosterNameTokenFreq = {};
seasonCompetitorPlayers.forEach(teamData => teamData.players.forEach(plyr => {
  const playerData = seasonPlayers.find(d => d.id === plyr.id);
  const rosterName = playerData?.display_first_name
    ? `${playerData.display_first_name} ${playerData?.display_last_name || playerData?.last_name}`
    : (playerData?.display_last_name || `${playerData?.first_name} ${playerData?.last_name}`);
  tokenSet(rosterName).forEach(tok => { rosterNameTokenFreq[tok] = (rosterNameTokenFreq[tok] || 0) + 1; });
}));

const unmatched = [];
const fuzzyMatches = [];
// ~~ displayName is the curated on-shirt name ("Joe Gomez", "Pape Matar Sarr"); formalName is the
// ~~ raw legal first+last name ("Joseph Dave Gomez"). formalName only feeds *exact* matching —
// ~~ it's long enough (often includes common first/middle names like "Joao"/"Pedro") that letting
// ~~ it into the fuzzy token-subset tier below produces false positives against unrelated players
// ~~ who happen to share one of those common name parts (e.g. Costinha's legal first name is
// ~~ "Joao Pedro", which isn't him — a different, unrelated Chelsea player goes by that name)
const findUnderstatPlayer = (id, displayName, formalName) => {
  if (MANUAL_UNDERSTAT_MATCHES[id]) {
    const normalized = normalizeName(MANUAL_UNDERSTAT_MATCHES[id]);
    if (understatByName.has(normalized)) return understatByName.get(normalized);
  }

  for (const candidate of [displayName, formalName]) {
    const normalized = normalizeName(candidate);
    if (understatByName.has(normalized)) return understatByName.get(normalized);
  }

  // ~~ token-subset: handles a dropped/added middle name or swapped first/last order
  // ~~ ("Pape Matar Sarr" vs "Pape Sarr", "Gnonto Wilfried" vs "Wilfried Gnonto") generically,
  // ~~ without hardcoding which side tends to have the extra word — restricted to the display
  // ~~ name only, see note above. No surname-only fallback beyond this: two different real
  // ~~ players sharing just a last name ("Cole Palmer" / "Alex Palmer") must never resolve to
  // ~~ the same Understat record, so an unresolved case is left unmatched rather than guessed.
  // ~~ if one side reduces to a single token ("Thiago" vs "Igor Thiago"), only trust it when that
  // ~~ token is unique across our own roster — otherwise a common first name like "Rayan" or
  // ~~ "Gabriel" would subset-match into an unrelated player's full name
  const queryTokens = tokenSet(displayName);
  if (queryTokens.size) {
    const subsetMatches = understatTokens.filter(({ tokens }) => {
      const minSize = Math.min(queryTokens.size, tokens.size);
      if (minSize === 0) return false;
      if (minSize >= 2) return isSubset(queryTokens, tokens) || isSubset(tokens, queryTokens);
      const soleQueryToken = queryTokens.size === 1 ? [...queryTokens][0] : null;
      const soleUnderstatToken = tokens.size === 1 ? [...tokens][0] : null;
      const unique = (soleQueryToken && (rosterNameTokenFreq[soleQueryToken] || 0) === 1) ||
        (soleUnderstatToken && (rosterNameTokenFreq[soleUnderstatToken] || 0) === 1);
      return unique && (isSubset(queryTokens, tokens) || isSubset(tokens, queryTokens));
    });
    if (subsetMatches.length === 1) {
      fuzzyMatches.push({ sportradarName: displayName, understatName: subsetMatches[0].player.player_name });
      return subsetMatches[0].player;
    }
  }

  unmatched.push(displayName);
  return null;
};

const posLookup = {
  midfielder: "MID",
  forward: "FWD",
  defender: "DEF",
  goalkeeper: "GK"
};

const compileLeaderList = (lastSeasonLeaders) => {
  const players = lastSeasonLeaders
    .map(d => d.players)
    .flat();
  const vals = players.map(d => {
    const id = d.id
    const val = d.competitors
      .map(x => x.datapoints.map(d => d.value).reduce((a, b) => a + b))
      .reduce((a, b) => a + b);
    return ({ id, val });
  })
  return vals;
}
const goals = compileLeaderList(lastSeasonLeaders.lists.find(d => d.type === 'goals').leaders);
const assists = compileLeaderList(lastSeasonLeaders.lists.find(d => d.type === 'assists').leaders);
const own_goals = compileLeaderList(lastSeasonLeaders.lists.find(d => d.type === 'own_goals').leaders);

seasonCompetitorPlayers.forEach(teamData => {
  const team_name = teamData.short_name;
  const team_abbr = teamData.abbreviation;
  teamData.players.forEach(plyr => {
    const id = plyr.id;
    const playerData = seasonPlayers.find(d => d.id === plyr.id);
    
    // ~~ position, name, and jersey number
    const pos = posLookup[plyr.type];
    // ~~ when sportradar has no display_first_name, display_last_name already holds the player's
    // ~~ full known name (e.g. "Joao Pedro", "Costinha") — appending raw first_name would duplicate it
    const name = playerData?.display_first_name
      ? `${playerData.display_first_name} ${playerData?.display_last_name || playerData?.last_name}`
      : (playerData?.display_last_name || `${playerData?.first_name} ${playerData?.last_name}`);
    const jersey_number = playerData?.jersey_number;

    // ~~ reference year epl stats
    const goals_ref = goals.find(d => d.id === id)?.val || 0;
    const assists_ref = assists.find(d => d.id === id)?.val || 0;
    const own_goals_ref = own_goals.find(d => d.id === id)?.val || 0;
    const points_ref = goals_ref + (assists_ref * 0.5) - own_goals_ref;

    // ~~ were they in the epl in the reference year?
    const playerDataRefIdx = lastSeasonPlayers.findIndex(d => d.id === plyr.id);
    const epl_in_ref = playerDataRefIdx > -1;

    // ~~ expected goals/assists for the reference season (Understat, joined by name — no shared ID)
    const formalName = `${playerData?.first_name} ${playerData?.last_name}`;
    const understatPlayer = findUnderstatPlayer(id, name, formalName);
    const xg_ref = understatPlayer ? Number(understatPlayer.xG) : null;
    const xa_ref = understatPlayer ? Number(understatPlayer.xA) : null;
    const xpoints_ref = understatPlayer ? xg_ref + (xa_ref * 0.5) : null;

    // ~~ return player data
    players.push ({
      id, name, team_abbr, team_name, pos, jersey_number,
      goals_ref, assists_ref, own_goals_ref, points_ref, epl_in_ref,
      xg_ref, xa_ref, xpoints_ref,
    });
  });
})

if (unmatched.length) {
  console.log(`~~~~~~ ${unmatched.length} players had no Understat match (no expected stats) ~~~~~~`);
}

// ~~ two review lists worth a human glance rather than trusting silently:
// ~~ 1) fuzzy matches — resolved via token-subset, not an exact name match, so worth a sanity check
if (fuzzyMatches.length) {
  console.log(`\n~~~~~~ ${fuzzyMatches.length} FUZZY matches (not exact name equality) — please review: ~~~~~~`);
  fuzzyMatches.forEach(m => console.log(`  "${m.sportradarName}" -> Understat "${m.understatName}"`));
}
// ~~ 2) unmatched players who nonetheless had real output last season — likelier to be a missed
// ~~ match than a genuinely data-less player, unlike the many zero-minute academy/loan names
const missingWithOutput = players.filter(p => p.xg_ref === null && (p.goals_ref > 0 || p.assists_ref > 0));
if (missingWithOutput.length) {
  console.log(`\n~~~~~~ ${missingWithOutput.length} UNMATCHED players who scored/assisted last season — please review: ~~~~~~`);
  missingWithOutput.forEach(p => console.log(`  ${p.name} (${p.team_name}) — ${p.goals_ref}g ${p.assists_ref}a`));
}

const playersSorted = players.sort((a, b) => b.points_ref - a.points_ref);
const cols = [
  "name", "team_abbr", "team_name", "pos", "jersey_number",
  "goals_ref", "assists_ref", "own_goals_ref", "points_ref", "epl_in_ref",
  "xg_ref", "xa_ref", "xpoints_ref",
  "id",
]
const csvString = [
    cols,
    ...playersSorted.map(d => cols.map(c => d[c]))
  ]
  .map(e => e.join(",")) 
  .join("\n");

const fileName = path.join(__dirname, config.year.toString(), `players_with_${config.reference_year}_data.csv`);
fs.writeFile(fileName, csvString, 'utf8', function (err) {
  if (err) {
    console.log('Some error occured - file either not saved or corrupted file saved.');
  } else{
    console.log(`~~~~~~ Saved ${fileName} ~~~~~~`);
  }
});