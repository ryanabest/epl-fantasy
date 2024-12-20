const fs = require('fs');
const path = require('path');
const { JWT } = require('google-auth-library');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../keys.json').google;

// Initialize auth - see https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication
const serviceAccountAuth = new JWT({
  // env var values here are copied from service account credentials generated by google
  // see "Authentication" section in docs for more info
  email: creds.client_email,
  key: creds.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const doc = new GoogleSpreadsheet('1sJHZmRTS5Yc3CDBOXY3LEedLOfdJjwQi95IXD3gjQe0', serviceAccountAuth);

async function getRoster () {
  await doc.loadInfo(); // loads document properties and worksheets
  const sheet = doc.sheetsByIndex[0]; // or use doc.sheetsById[id]
  const data = [];
  const rows = await sheet.getRows(); // can pass in { limit, offset }
  rows.forEach(row => {
    const rowData = {};
    sheet.headerValues.forEach(header => {
      rowData[header] = row.get(header);
    });
    data.push(rowData);
  });
  const teamData = [];
  const teams = [... new Set(data.map(d => d.Team))].sort()
  teams.forEach(t => {
    teamData.push({
      team: t,
      players: data.filter(d => d.Team === t)
    });
  });
  return teamData;
}

getRoster().then(rosters => {
  const filePath = path.join(__dirname, 'rosters.json');
  fs.writeFileSync(filePath, JSON.stringify(rosters, null, 4));
});