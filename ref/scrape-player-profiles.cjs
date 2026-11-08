const fs = require('fs');
const path = require('path');
const config = require('../config').default;
const keys = require('../keys.json');
const options = {method: 'GET', headers: {accept: 'application/json'}};

const withoutGeneratedAt = (obj) => {
  const {generated_at, ...rest} = obj;
  return rest;
}

const save = (response, filePath) => {
  // guard: never overwrite a profile with an error response (e.g. {"message":"Too Many Requests"})
  if (!response || !response.player || !response.player.id) {
    console.error(`~~~~~~ NOT SAVED ${filePath} (invalid response: ${JSON.stringify(response).slice(0, 100)}) ~~~~~~`);
    return false;
  }
  if (fs.existsSync(filePath)) {
    const previous = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (JSON.stringify(withoutGeneratedAt(previous)) === JSON.stringify(withoutGeneratedAt(response))) {
      console.log(`~~~~~~ SKIPPED ${filePath} (no changes) ~~~~~~`);
      return true;
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(response, null, 4));
  console.log(`~~~~~~ SAVED ${filePath} ~~~~~~`);
  return true;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// fetch with retries on rate limits / invalid responses
const fetchProfile = async (url, retries = 3) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      const json = await res.json();
      if (res.ok && json.player) return json;
      console.warn(`Bad response (${res.status}) ${JSON.stringify(json).slice(0, 100)}; attempt ${attempt + 1}/${retries + 1}`);
    } catch (err) {
      console.warn(`Fetch error: ${err.message}; attempt ${attempt + 1}/${retries + 1}`);
    }
    await sleep(10000 * (attempt + 1));
  }
  return null;
};

// put all urls in a list
const urls = [];
const rosters = require(path.join(__dirname, '../google/', config.year.toString(), 'rosters.json'));
rosters.forEach(roster => {
  roster.players.forEach(player => {
    const url = {
      id: player.ID,
      url: `https://api.sportradar.com/soccer/trial/v4/en/players/${player.ID}/profile.json?api_key=${keys.sportradar}`
    };
    urls.push(url)
  });
});

// optionally limit to specific ids: node ref/scrape-player-profiles.cjs sr:player:151545 ...
const onlyIds = process.argv.slice(2);
const toFetch = onlyIds.length ? urls.filter(u => onlyIds.includes(u.id)) : urls;

// save player profile for each url (sequentially, 3s apart)
(async () => {
  const failed = [];
  for (const url of toFetch) {
    const response = await fetchProfile(url.url);
    const filePath = path.join(__dirname, config.year.toString(), `player_profiles/${url.id}.json`);
    if (!response || !save(response, filePath)) failed.push(url.id);
    await sleep(3000);
  }
  if (failed.length) {
    console.error(`FAILED (${failed.length}): ${failed.join(' ')}`);
    process.exitCode = 1;
  }
})();
