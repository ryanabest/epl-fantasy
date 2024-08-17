const fs = require('fs');
const path = require('path');
const keys = require('../keys.json');
const options = {method: 'GET', headers: {accept: 'application/json'}};

const save = (response) => {
  const fileName = 'schedule.json';
  const filePath = path.join(__dirname, fileName);
  fs.writeFileSync(filePath, JSON.stringify(response, null, 4));
  console.log(`~~~~~~ SAVED ${fileName} ~~~~~~`);
}

const getMatches = (response) => {
  const savedMatchFiles = fs.readdirSync(path.join(__dirname, "sport_event"));
  const matches = response.schedules.filter(match => {
    return match.sport_event_status.status === "closed" &&
      match.sport_event_status.match_status === "ended" &&
      !savedMatchFiles.includes(`${match.sport_event.id}.json`)
  });
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    setTimeout(() => {
      const id = match.sport_event.id;
      fetch(`https://api.sportradar.com/soccer/trial/v4/en/sport_events/${id}/summary.json?api_key=${keys.sportradar}`, options)
        .then(r => r.json())
        .then(r => {
          const fileName = `${id}.json`;
          const filePath = path.join(__dirname, `sport_event/${fileName}`);
          fs.writeFileSync(filePath, JSON.stringify(r, null, 4));
          console.log(`~~~~~~ SAVED ${fileName} ~~~~~~`);
        })
        .catch(err => console.error(err));
    }, 3000 * i);
  }
}

// ~~ GET SEASON SCHEDULE ~~ //
fetch(`https://api.sportradar.com/soccer/trial/v4/en/seasons/sr%3Aseason%3A118689/schedules.json?api_key=${keys.sportradar}`, options)
  .then(response => response.json())
  .then(response => {
    save(response);
    getMatches(response);
  })
  .catch(err => console.error(err));