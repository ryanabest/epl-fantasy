const fs = require('fs');
const path = require('path');
const request = require('request');
const keys = require('../keys.json');
const competitors = require('./competitors.json').season_competitors;
const scrapeList = [];
competitors.forEach(d => {
  scrapeList.push({
    url: `https://api.sportradar.com/soccer/trial/v4/en/competitors/${d.id}/profile.json?api_key=${keys.sportradar}`,
    name: `${d.id}.json`,
    filePath: path.join(__dirname, `teams/${d.id}.json`)
  });
});
for (let i = 0; i < scrapeList.length; i++) {
  const s = scrapeList[i];
  setTimeout(() => {
    request(s.url, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        const data = JSON.parse(body);
        console.log(`~~~~~~ SAVED ${s.name} ~~~~~~`);
        fs.writeFileSync(s.filePath, JSON.stringify(data, null, 4));
      } else {
        console.log(`~~~~~~ FAILED FOR ${s.url} ~~~~~~`);
        console.log(body);
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
      }
    });
  }, 3000 * i);
}