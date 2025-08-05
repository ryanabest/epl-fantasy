const fs = require('fs');
const path = require('path');
const keys = require('../keys.json');
const request = require('request');
const options = {method: 'GET', headers: {accept: 'application/json'}};
const config = require('../config').default;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const save = (data, fileName, filePath) => {
  if (data.message === 'Too Many Requests') {
    console.log(fileName, data.message)
  } else {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log(`~~~~~~ SAVED ${filePath} ~~~~~~`);
  }
}

async function getSeasonLeaders() {
  await delay(2000); // Wait for 2 seconds
  try {
    const url = `https://api.sportradar.com/soccer/trial/v4/en/seasons/${config.season_id_sportradar}/leaders.json?api_key=${keys.sportradar}`;
    const response = await fetch(url, options);
    const data = await response.json();
    const fileName = 'leaders.json';
    const filePath = path.join(__dirname, config.year.toString(), fileName);
    save(data, fileName, filePath);
    // return data;
  } catch (error) {
    console.error('getSeasonLeaders Error:', error);
    throw error; // Re-throw the error to be caught by a subsequent .catch()
  }
}

async function getSeasonPlayers() {
  await delay(2000); // Wait for 2 seconds
  try {
    const url = `https://api.sportradar.com/soccer/trial/v4/en/seasons/${config.season_id_sportradar}/players.json?api_key=${keys.sportradar}`;
    const response = await fetch(url, options);
    const data = await response.json();
    const fileName = 'players.json'
    const filePath = path.join(__dirname, config.year.toString(), fileName);
    save(data, fileName, filePath);
    // return data;
  } catch (error) {
    console.error('getSeasonPlayers Error:', error);
    throw error; // Re-throw the error to be caught by a subsequent .catch()
  }
}

async function getSeasonCompetitorPlayers() {
  await delay(2000); // Wait for 2 seconds
  try {
    const url = `https://api.sportradar.com/soccer/trial/v4/en/seasons/${config.season_id_sportradar}/competitor_players.json?api_key=${keys.sportradar}`;
    const response = await fetch(url, options);
    const data = await response.json();
    const fileName = 'competitor_players.json';
    const filePath = path.join(__dirname, config.year.toString(), fileName);
    save(data, fileName, filePath);
    return data;
  } catch (error) {
    console.error('getSeasonCompetitorPlayerss Error:', error);
    throw error; // Re-throw the error to be caught by a subsequent .catch()
  }
}

getSeasonPlayers()
  .then(() => getSeasonLeaders())
  .then(() => getSeasonCompetitorPlayers());
