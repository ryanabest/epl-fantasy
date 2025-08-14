export const slugify = (str) => {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-').trim();
}

export const formatNum = (num) => {
  return num === 0 ? '.' : num;
}

export const eplTeamDisplayNameLookup = {
  'Manchester United': 'Man Utd',
  'Manchester City': 'Man City',
  'Leeds United': 'Leeds',
  'Wolverhampton': 'Wolves',
  'Nottingham': 'Nottm Forest',
}