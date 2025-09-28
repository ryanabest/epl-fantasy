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
  'Wolverhampton Wanderers': 'Wolves',
  'Nottingham': 'Nottm Forest',
  'Nottingham Forest': 'Nottm Forest',
  'Chelsea FC': 'Chelsea',
  'Tottenham Hotspur': 'Spurs',
  'Newcastle United': 'Newcastle',
  'AFC Bournemouth': 'Bournemouth',
  'Brighton & Hove Albion': 'Brighton',
  'Brentford FC': 'Brentford',
  'West Ham United': 'West Ham',
  'Crystal Palace': 'Crystal Palace',
  'Fulham FC': 'Fulham',
  // 'Aston Villa': 'Aston Villa',
  'Everton FC': 'Everton',
  'Southampton FC': 'Southampton',
  'Arsenal FC': 'Arsenal',
  'Liverpool FC': 'Liverpool',
  'Leicester City': 'Leicester',
  'Burnley FC': 'Burnley', 
  'Sunderland AFC': 'Sunderland',
}