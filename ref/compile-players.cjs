const fs = require('fs');
const path = require('path');
const config = require('../config').default;
const seasonCompetitorPlayers = require(path.join(__dirname,  config.year.toString(), 'competitor_players.json')).season_competitor_players;
const seasonPlayers = require(path.join(__dirname,  config.year.toString(), 'players.json')).season_players;
const lastSeasonLeaders = require(path.join(__dirname, config.reference_year.toString(), 'leaders.json'));
const lastSeasonPlayers = require(path.join(__dirname, config.reference_year.toString(), 'players.json')).season_players;

const players = [];

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
    const name = `${playerData?.display_first_name || playerData?.first_name} ${playerData?.display_last_name || playerData?.last_name}`;
    const jersey_number = playerData?.jersey_number;

    // ~~ reference year epl stats
    const goals_ref = goals.find(d => d.id === id)?.val || 0;
    const assists_ref = assists.find(d => d.id === id)?.val || 0;
    const own_goals_ref = own_goals.find(d => d.id === id)?.val || 0;
    const points_ref = goals_ref + (assists_ref * 0.5) - own_goals_ref;

    // ~~ were they in the epl in the reference year?
    const playerDataRefIdx = lastSeasonPlayers.findIndex(d => d.id === plyr.id);
    const epl_in_ref = playerDataRefIdx > -1;

    // ~~ return player data
    players.push ({ id, name, team_abbr, team_name, pos, jersey_number, goals_ref, assists_ref, own_goals_ref, points_ref, epl_in_ref });
  });
})

const playersSorted = players.sort((a, b) => b.points_ref - a.points_ref);
const cols = ["name", "team_abbr", "team_name", "pos", "jersey_number", "goals_ref", "assists_ref", "own_goals_ref", "points_ref", "epl_in_ref", "id"]
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