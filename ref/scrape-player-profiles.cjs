const fs = require('fs');
const path = require('path');
const config = require('../config').default;
const keys = require('../keys.json');
const options = {method: 'GET', headers: {accept: 'application/json'}};

const save = (response, filePath) => {
  fs.writeFileSync(filePath, JSON.stringify(response, null, 4));
  console.log(`~~~~~~ SAVED ${filePath} ~~~~~~`);
}

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

// save prlayer profile for each url
for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  setTimeout(() => {
    fetch(url.url, options)
      .then(r => r.json())
      .then(r => {
        const fileName = `${url.id}.json`;
        const filePath = path.join(__dirname, config.year.toString(), `player_profiles/${fileName}`);
        save(r, filePath);
      })
      .catch(err => console.error(err));
  }, 3000 * i);
}