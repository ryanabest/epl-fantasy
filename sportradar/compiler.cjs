const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const config = require('../config').default;

class Compiler {
  constructor () {
    this.rosters = require(path.join(__dirname, '../google/', config.year.toString(), 'rosters.json'));
    this.last_updated = require(path.join(__dirname, config.year.toString(), 'schedule.json')).generated_at;
    this.start_date = config.start_date;
    this.compileAllGames();
    this.compilePlayersRef();
    this.compileData();
    this.saveData();
  }

  compileAllGames () {
      this.all_games = [];
      const files = fs.readdirSync(path.join(__dirname, config.year.toString(), "sport_event")).filter(d => d.includes('.json'));
      files.forEach(file => {
        const match = require(path.join(__dirname, config.year.toString(), `sport_event/${file}`));
        match.all_players = match.statistics.totals.competitors.map(d => d.players).flat();
        this.all_games.push(match);
      });
      const dates = [... new Set(this.all_games.map(d => dayjs(d.sport_event.start_time).format('YYYY-MM-DD')))].sort();
      this.end_date = dates[dates.length - 1] || this.start_date;
      const filePath = path.join(__dirname, config.year.toString(), "all_games.json");
      fs.writeFileSync(filePath, JSON.stringify(this.all_games, null, 4));
  }

  compilePlayersRef () {
    const competitorPlayers = require(path.join(__dirname, '..', 'ref', config.year.toString(), 'competitor_players.json'));
    const allTeams = competitorPlayers.season_competitor_players;

    const allPlayersGone = [];
    const playersGoneFolder = path.join(__dirname, '..', 'ref', config.year.toString(), 'players_gone');
    fs.readdirSync(playersGoneFolder).forEach(file => {
      const playerData = require(path.join(__dirname, '..', 'ref', config.year.toString(), 'players_gone', file));
      allPlayersGone.push(playerData);
    });

    this.players_ref = []
    allTeams.forEach(t => {
      const playerTeam = t.short_name;
      t.players.forEach(p => {
        const sportradarId = p.id;
        const playerName = p.name
          .split(",")
          .map(d => d.trim())
          .reverse()
          .join(' ');
        const position = {
          midfielder: "MID",
          forward: "FWD",
          defender: "DEF",
          goalkeeper: "GK"
        }[p.type];
        const jersey = p.jersey_number;
        this.players_ref.push({ sportradarId, playerName, playerTeam, position, jersey });
      });
    });

    allPlayersGone.forEach(p => {
      const sportradarId = p.player.id;
      const playerName = p.player.name
        .split(",")
        .map(d => d.trim())
        .reverse()
        .join(' ');
      const position = {
        midfielder: "MID",
        forward: "FWD",
        defender: "DEF",
        goalkeeper: "GK"
      }[p.player.type];
      const jersey = p.player.jersey_number;
      const playerTeam = p.competitors?.find(d => d.name !== d.country)?.name || "N/A";
      this.players_ref.push({ sportradarId, playerName, playerTeam, position, jersey });
    });
  }

  compileData () {
    this.data = { last_updated: this.last_updated };
    this.data.teams = this.rosters.map(roster => {
      const players = roster.players.map(p => {
        // ~~ player ref ~~ //
        const playerRef = this.players_ref.find(d => d.sportradarId === p.ID);
        if (!playerRef) {
          console.log(p);
        }
        const sportradarId = playerRef?.sportradarId;
        const playerName = playerRef?.playerName;
        const playerTeam = playerRef?.playerTeam;
        const position = playerRef?.position;
        const jersey = playerRef?.jersey;

        // ~~ match stats and totals ~~ //
        const schedule = this.all_games
          .filter(game => game.all_players.find(d => d.id === playerRef?.sportradarId))
          .map(game => {
            const day = dayjs(game.sport_event.start_time);
            const player = game.all_players.find(d => d.id === playerRef?.sportradarId).statistics;
            const goals = player.goals_scored;
            const assists = player.assists;
            const ownGoals = player.own_goals;
            const points = goals + (assists * 0.5) - ownGoals;
            return { date: day.format('YYYY-MM-DD'), goals, assists, own_goals: ownGoals, points }
          });
        const goals = schedule.map(d => d.goals).reduce((a, b) => a + b, 0);
        const assists = schedule.map(d => d.assists).reduce((a, b) => a + b, 0);
        const ownGoals = schedule.map(d => d.own_goals).reduce((a, b) => a + b, 0);
        const points = goals + (assists * 0.5) - ownGoals;
        const stats = { goals, assists, own_goals: ownGoals, points };

        return { sportradarId, playerName, playerTeam, position, jersey, schedule, stats }
      });

      // ~~ team totals ~~ //
      const goals = players.map(d => d.stats.goals).reduce((a, b) => a + b, 0);
      const assists = players.map(d => d.stats.assists).reduce((a, b) => a + b, 0);
      const ownGoals = players.map(d => d.stats.own_goals).reduce((a, b) => a + b, 0);
      const points = goals + (assists * 0.5) - ownGoals;

      const pointsByDate = [ ];
      let dt = dayjs(this.start_date);
      while (dt <= dayjs(this.end_date)) {
        let points = 0;
        players.forEach(player => {
          const scheduleFiltered = player.schedule.filter(d => dayjs(d.date) <= dt);
          const pts = scheduleFiltered.map(d => d.points).reduce((a, b) => a + b, 0);
          points += pts;
        })
        
        pointsByDate.push({date: dt.format('YYYY-MM-DD'), points});
        dt = dt.add(1, 'day');
      }

      return { team: roster.team, goals, assists, own_goals: ownGoals, points, players, pointsByDate };
    });
  }

  saveData () {
    const filePath = path.join(__dirname, '..', 'src', 'assets', config.year.toString(), 'data.json');
    fs.writeFileSync(filePath, JSON.stringify(this.data, null, 4));
  }
}

module.exports = Compiler;