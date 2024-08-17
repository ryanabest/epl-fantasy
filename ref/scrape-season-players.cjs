const fs = require('fs');
const path = require('path');
const keys = require('../keys.json');
const options = {method: 'GET', headers: {accept: 'application/json'}};

fetch(`https://api.sportradar.com/soccer/trial/v4/en/seasons/sr%3Aseason%3A118689/players.json?api_key=${keys.sportradar}`, options)
  .then(response => response.json())
  .then(response => {
    const filePath = path.join(__dirname, 'players.json');
    fs.writeFileSync(filePath, JSON.stringify(response, null, 2));
  })
  .catch(err => console.error(err));
