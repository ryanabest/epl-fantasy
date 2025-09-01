const fs = require('fs');
const path = require('path');
const keys = require('../keys.json');
const options = {method: 'GET', headers: {accept: 'application/json'}};
const config = require('../config').default;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const save = (response, filePath) => {
  fs.writeFileSync(filePath, JSON.stringify(response, null, 4));
  console.log(`~~~~~~ SAVED ${filePath} ~~~~~~`);
}

async function getSeasonSchedule() {
  await delay(2000); // Wait for 2 seconds
  try {
    const url = `https://api.sportradar.com/soccer/trial/v4/en/seasons/${config.season_id_sportradar}/schedules.json?api_key=${keys.sportradar}`;
    const response = await fetch(url, options);
    const data = await response.json();
    const fileName = 'schedule.json';
    const filePath = path.join(__dirname, config.year.toString(), fileName);
    save(data, filePath);
    return data;
  } catch(error) {
    console.error('getSeasonSchedule Error:', error);
    throw error; // Re-throw the error to be caught by a subsequent .catch()
  }
}

async function getMatches (response) {
  await delay(2000); // Wait for 2 seconds
  const savedMatchFiles = fs.readdirSync(path.join(__dirname, config.year.toString(), "sport_event"));
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
          const filePath = path.join(__dirname, config.year.toString(), `sport_event/${fileName}`);
          save(r, filePath);
        })
        .catch(err => console.error(err));
    }, 3000 * i);
  }
}

getSeasonSchedule()
  .then(seasonSchedule => getMatches(seasonSchedule));