const fs = require('fs');
const path = require('path');
const config = require('../config').default;

const LEAGUE = 'EPL';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getCookie(season) {
  const res = await fetch(`https://understat.com/league/${LEAGUE}/${season}`, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const cookies = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  return cookies.map(c => c.split(';')[0]).join('; ');
}

async function getPlayersStats(season, cookie) {
  const res = await fetch('https://understat.com/main/getPlayersStats/', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': `https://understat.com/league/${LEAGUE}/${season}`,
      'Cookie': cookie,
    },
    body: `league=${LEAGUE}&season=${season}`
  });
  const data = await res.json();
  if (!data.success) throw new Error(`Understat request failed for season ${season}`);
  return data.players;
}

async function scrapeSeason(season) {
  const cookie = await getCookie(season);
  await delay(500);
  const players = await getPlayersStats(season, cookie);
  const filePath = path.join(__dirname, season.toString(), 'understat_players.json');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(players, null, 4));
  console.log(`~~~~~~ SAVED ${filePath} (${players.length} players) ~~~~~~`);
}

scrapeSeason(config.reference_year).catch(err => {
  console.error('scrapeSeason Error:', err);
  process.exit(1);
});
