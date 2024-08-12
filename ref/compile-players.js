const fs = require('fs');
const path = require('path');
const teamsFolder = path.join(__dirname, 'teams');
const seasonPlayers = require(path.join(__dirname, 'players.json')).season_players;
const leaders = require(path.join(__dirname, 'leaders.json'));
const seasonPlayers2023 = require(path.join(__dirname, 'players_2023.json')).season_players;

const players = [];

const posLookup = {
  midfielder: "MID",
  forward: "FWD",
  defender: "DEF",
  goalkeeper: "GK"
};

const compileLeaderList = (leaders) => {
  const players = leaders
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
const goals = compileLeaderList(leaders.lists.find(d => d.type === 'goals').leaders);
const assists = compileLeaderList(leaders.lists.find(d => d.type === 'assists').leaders);
const own_goals = compileLeaderList(leaders.lists.find(d => d.type === 'own_goals').leaders);

fs.readdirSync(teamsFolder).forEach(file => {
  const teamData = require(path.join(__dirname, `teams/${file}`));
  const team_name = teamData.competitor.short_name;
  const team_abbr = teamData.competitor.abbreviation;
  teamData.players.forEach(plyr => {
    const id = plyr.id;
    const playerData = seasonPlayers.find(d => d.id === plyr.id);
    
    // ~~ position, name, and jersey number
    const pos = posLookup[plyr.type];
    const name = `${playerData?.display_first_name || playerData?.first_name} ${playerData?.display_last_name || playerData?.last_name}`;
    const jersey_number = playerData?.jersey_number;

    // ~~ 2023 epl stats
    const goals_2023 = goals.find(d => d.id === id)?.val || 0;
    const assists_2023 = assists.find(d => d.id === id)?.val || 0;
    const own_goals_2023 = own_goals.find(d => d.id === id)?.val || 0;
    const points_2023 = goals_2023 + (assists_2023 * 0.5) - own_goals_2023;

    // ~~ were they in the epl in 2023?
    const playerData2023Idx = seasonPlayers2023.findIndex(d => d.id === plyr.id);
    const epl_in_2023 = playerData2023Idx > -1;

    // ~~ return player data
    players.push ({ id, name, team_abbr, team_name, pos, jersey_number, goals_2023, assists_2023, own_goals_2023, points_2023, epl_in_2023 });
  });
});

const playersSorted = players.sort((a, b) => b.points_2023 - a.points_2023);
const cols = ["name", "team_abbr", "team_name", "pos", "jersey_number", "goals_2023", "assists_2023", "own_goals_2023", "points_2023", "epl_in_2023", "id"]
const csvString = [
    cols,
    ...playersSorted.map(d => cols.map(c => d[c]))
  ]
  .map(e => e.join(",")) 
  .join("\n");

fs.writeFile(path.join(__dirname, 'players_with_2023_data.csv'), csvString, 'utf8', function (err) {
  if (err) {
    console.log('Some error occured - file either not saved or corrupted file saved.');
  } else{
    console.log('It\'s saved!');
  }
});