export const OWNERS = [
  { name: 'Achal' },
  { name: 'Aditya' },
  { name: 'Arun' },
  { name: 'Ashwin' },
  { name: 'Bikash' },
  { name: 'Bimal' },
  { name: 'Biplav' },
  { name: 'Bishal' },
]

export const TEAMS: Array<{ team_name: string; pot_number: number; owner_name: string; group_name: string }> = [
  // Pot 1
  { team_name: 'Spain', pot_number: 1, owner_name: 'Achal', group_name: 'H' },
  { team_name: 'France', pot_number: 1, owner_name: 'Aditya', group_name: 'I' },
  { team_name: 'Argentina', pot_number: 1, owner_name: 'Bikash', group_name: 'J' },
  { team_name: 'England', pot_number: 1, owner_name: 'Ashwin', group_name: 'L' },
  { team_name: 'Brazil', pot_number: 1, owner_name: 'Arun', group_name: 'C' },
  { team_name: 'Portugal', pot_number: 1, owner_name: 'Biplav', group_name: 'K' },
  { team_name: 'Netherlands', pot_number: 1, owner_name: 'Bimal', group_name: 'F' },
  { team_name: 'Germany', pot_number: 1, owner_name: 'Bishal', group_name: 'E' },
  // Pot 2
  { team_name: 'Croatia', pot_number: 2, owner_name: 'Arun', group_name: 'L' },
  { team_name: 'Belgium', pot_number: 2, owner_name: 'Aditya', group_name: 'G' },
  { team_name: 'Colombia', pot_number: 2, owner_name: 'Bishal', group_name: 'K' },
  { team_name: 'Morocco', pot_number: 2, owner_name: 'Achal', group_name: 'C' },
  { team_name: 'Senegal', pot_number: 2, owner_name: 'Biplav', group_name: 'I' },
  { team_name: 'Japan', pot_number: 2, owner_name: 'Ashwin', group_name: 'F' },
  { team_name: 'Uruguay', pot_number: 2, owner_name: 'Bimal', group_name: 'H' },
  { team_name: 'Switzerland', pot_number: 2, owner_name: 'Bikash', group_name: 'B' },
  // Pot 3
  { team_name: 'Mexico', pot_number: 3, owner_name: 'Arun', group_name: 'A' },
  { team_name: 'Turkiye', pot_number: 3, owner_name: 'Achal', group_name: 'D' },
  { team_name: 'Ecuador', pot_number: 3, owner_name: 'Bikash', group_name: 'E' },
  { team_name: 'Norway', pot_number: 3, owner_name: 'Ashwin', group_name: 'I' },
  { team_name: 'Austria', pot_number: 3, owner_name: 'Bimal', group_name: 'J' },
  { team_name: 'USA', pot_number: 3, owner_name: 'Aditya', group_name: 'D' },
  { team_name: 'Iran', pot_number: 3, owner_name: 'Biplav', group_name: 'G' },
  { team_name: 'Australia', pot_number: 3, owner_name: 'Bishal', group_name: 'D' },
  // Pot 4
  { team_name: 'South Korea', pot_number: 4, owner_name: 'Bikash', group_name: 'A' },
  { team_name: 'Canada', pot_number: 4, owner_name: 'Ashwin', group_name: 'B' },
  { team_name: 'Algeria', pot_number: 4, owner_name: 'Aditya', group_name: 'J' },
  { team_name: 'Paraguay', pot_number: 4, owner_name: 'Arun', group_name: 'D' },
  { team_name: 'Egypt', pot_number: 4, owner_name: 'Bishal', group_name: 'G' },
  { team_name: 'Panama', pot_number: 4, owner_name: 'Achal', group_name: 'L' },
  { team_name: 'Scotland', pot_number: 4, owner_name: 'Bimal', group_name: 'C' },
  { team_name: 'Sweden', pot_number: 4, owner_name: 'Biplav', group_name: 'F' },
  // Pot 5
  { team_name: "Cote d'Ivoire", pot_number: 5, owner_name: 'Achal', group_name: 'E' },
  { team_name: 'Czechia', pot_number: 5, owner_name: 'Biplav', group_name: 'A' },
  { team_name: 'Uzbekistan', pot_number: 5, owner_name: 'Bikash', group_name: 'K' },
  { team_name: 'DR Congo', pot_number: 5, owner_name: 'Arun', group_name: 'K' },
  { team_name: 'Tunisia', pot_number: 5, owner_name: 'Bishal', group_name: 'F' },
  { team_name: 'Iraq', pot_number: 5, owner_name: 'Bimal', group_name: 'I' },
  { team_name: 'Jordan', pot_number: 5, owner_name: 'Ashwin', group_name: 'J' },
  { team_name: 'Saudi Arabia', pot_number: 5, owner_name: 'Aditya', group_name: 'H' },
  // Pot 6
  { team_name: 'South Africa', pot_number: 6, owner_name: 'Achal', group_name: 'A' },
  { team_name: 'Qatar', pot_number: 6, owner_name: 'Biplav', group_name: 'B' },
  { team_name: 'Bosnia & Herzegovina', pot_number: 6, owner_name: 'Bishal', group_name: 'B' },
  { team_name: 'Cape Verde', pot_number: 6, owner_name: 'Bikash', group_name: 'H' },
  { team_name: 'Ghana', pot_number: 6, owner_name: 'Bimal', group_name: 'L' },
  { team_name: 'New Zealand', pot_number: 6, owner_name: 'Arun', group_name: 'G' },
  { team_name: 'Haiti', pot_number: 6, owner_name: 'Aditya', group_name: 'C' },
  { team_name: 'Curacao', pot_number: 6, owner_name: 'Ashwin', group_name: 'E' },
]

export type GroupStageMatch = {
  group_name: string
  match_date: string
  match_time: string
  venue: string
  home_team: string
  away_team: string
}

export const GROUP_STAGE_MATCHES: GroupStageMatch[] = [
  // Friday, June 12
  { group_name: 'A', match_date: '2026-06-12', match_time: '12:45 AM', venue: 'Mexico City', home_team: 'Mexico', away_team: 'South Africa' },
  { group_name: 'A', match_date: '2026-06-12', match_time: '7:45 AM', venue: 'Zapopan, Mexico', home_team: 'South Korea', away_team: 'Czechia' },
  // Saturday, June 13
  { group_name: 'B', match_date: '2026-06-13', match_time: '12:45 AM', venue: 'Toronto', home_team: 'Canada', away_team: 'Bosnia & Herzegovina' },
  { group_name: 'D', match_date: '2026-06-13', match_time: '6:45 AM', venue: 'Inglewood, Calif.', home_team: 'USA', away_team: 'Paraguay' },
  // Sunday, June 14
  { group_name: 'B', match_date: '2026-06-14', match_time: '12:45 AM', venue: 'Santa Clara, Calif.', home_team: 'Qatar', away_team: 'Switzerland' },
  { group_name: 'C', match_date: '2026-06-14', match_time: '3:45 AM', venue: 'East Rutherford, New Jersey', home_team: 'Brazil', away_team: 'Morocco' },
  { group_name: 'C', match_date: '2026-06-14', match_time: '6:45 AM', venue: 'Foxborough, Mass.', home_team: 'Haiti', away_team: 'Scotland' },
  { group_name: 'D', match_date: '2026-06-14', match_time: '9:45 AM', venue: 'Vancouver, Canada', home_team: 'Australia', away_team: 'Turkiye' },
  { group_name: 'E', match_date: '2026-06-14', match_time: '10:45 PM', venue: 'Houston', home_team: 'Germany', away_team: 'Curacao' },
  // Monday, June 15
  { group_name: 'F', match_date: '2026-06-15', match_time: '1:45 AM', venue: 'Arlington, Texas', home_team: 'Netherlands', away_team: 'Japan' },
  { group_name: 'E', match_date: '2026-06-15', match_time: '4:45 AM', venue: 'Philadelphia', home_team: "Cote d'Ivoire", away_team: 'Ecuador' },
  { group_name: 'F', match_date: '2026-06-15', match_time: '7:45 AM', venue: 'Guadalupe, Mexico', home_team: 'Sweden', away_team: 'Tunisia' },
  { group_name: 'H', match_date: '2026-06-15', match_time: '9:45 PM', venue: 'Atlanta', home_team: 'Spain', away_team: 'Cape Verde' },
  // Tuesday, June 16
  { group_name: 'G', match_date: '2026-06-16', match_time: '12:45 AM', venue: 'Seattle', home_team: 'Belgium', away_team: 'Egypt' },
  { group_name: 'H', match_date: '2026-06-16', match_time: '3:45 AM', venue: 'Miami Gardens, Fla.', home_team: 'Saudi Arabia', away_team: 'Uruguay' },
  { group_name: 'G', match_date: '2026-06-16', match_time: '6:45 AM', venue: 'Inglewood, Calif.', home_team: 'Iran', away_team: 'New Zealand' },
  // Wednesday, June 17
  { group_name: 'I', match_date: '2026-06-17', match_time: '12:45 AM', venue: 'East Rutherford, N.J.', home_team: 'France', away_team: 'Senegal' },
  { group_name: 'I', match_date: '2026-06-17', match_time: '3:45 AM', venue: 'Foxborough, Mass.', home_team: 'Iraq', away_team: 'Norway' },
  { group_name: 'J', match_date: '2026-06-17', match_time: '6:45 AM', venue: 'Kansas City, Mo.', home_team: 'Argentina', away_team: 'Algeria' },
  { group_name: 'J', match_date: '2026-06-17', match_time: '9:45 AM', venue: 'Santa Clara, Calif.', home_team: 'Austria', away_team: 'Jordan' },
  { group_name: 'K', match_date: '2026-06-17', match_time: '10:45 PM', venue: 'Houston', home_team: 'Portugal', away_team: 'DR Congo' },
  // Thursday, June 18
  { group_name: 'L', match_date: '2026-06-18', match_time: '1:45 AM', venue: 'Arlington, Texas', home_team: 'England', away_team: 'Croatia' },
  { group_name: 'L', match_date: '2026-06-18', match_time: '4:45 AM', venue: 'Toronto', home_team: 'Ghana', away_team: 'Panama' },
  { group_name: 'K', match_date: '2026-06-18', match_time: '7:45 AM', venue: 'Mexico City', home_team: 'Uzbekistan', away_team: 'Colombia' },
  { group_name: 'A', match_date: '2026-06-18', match_time: '9:45 PM', venue: 'Atlanta', home_team: 'Czechia', away_team: 'South Africa' },
  // Friday, June 19
  { group_name: 'B', match_date: '2026-06-19', match_time: '12:45 AM', venue: 'Inglewood, Calif.', home_team: 'Switzerland', away_team: 'Bosnia & Herzegovina' },
  { group_name: 'B', match_date: '2026-06-19', match_time: '3:45 AM', venue: 'Vancouver, Canada', home_team: 'Canada', away_team: 'Qatar' },
  { group_name: 'A', match_date: '2026-06-19', match_time: '6:45 AM', venue: 'Zapopan, Mexico', home_team: 'Mexico', away_team: 'South Korea' },
  // Saturday, June 20
  { group_name: 'D', match_date: '2026-06-20', match_time: '12:45 AM', venue: 'Seattle', home_team: 'USA', away_team: 'Australia' },
  { group_name: 'C', match_date: '2026-06-20', match_time: '3:45 AM', venue: 'Foxborough, Mass.', home_team: 'Scotland', away_team: 'Morocco' },
  { group_name: 'C', match_date: '2026-06-20', match_time: '6:15 AM', venue: 'Philadelphia', home_team: 'Brazil', away_team: 'Haiti' },
  { group_name: 'D', match_date: '2026-06-20', match_time: '8:45 AM', venue: 'Santa Clara, Calif.', home_team: 'Turkiye', away_team: 'Paraguay' },
  { group_name: 'F', match_date: '2026-06-20', match_time: '10:45 PM', venue: 'Houston', home_team: 'Netherlands', away_team: 'Sweden' },
  // Sunday, June 21
  { group_name: 'E', match_date: '2026-06-21', match_time: '1:45 AM', venue: 'Toronto', home_team: 'Germany', away_team: "Cote d'Ivoire" },
  { group_name: 'E', match_date: '2026-06-21', match_time: '5:45 AM', venue: 'Kansas City, Mo.', home_team: 'Ecuador', away_team: 'Curacao' },
  { group_name: 'F', match_date: '2026-06-21', match_time: '9:45 AM', venue: 'Guadalupe, Mexico', home_team: 'Tunisia', away_team: 'Japan' },
  { group_name: 'H', match_date: '2026-06-21', match_time: '9:45 PM', venue: 'Atlanta', home_team: 'Spain', away_team: 'Saudi Arabia' },
  // Monday, June 22
  { group_name: 'G', match_date: '2026-06-22', match_time: '12:45 AM', venue: 'Inglewood, Calif.', home_team: 'Belgium', away_team: 'Iran' },
  { group_name: 'H', match_date: '2026-06-22', match_time: '3:45 AM', venue: 'Miami Gardens, Fla.', home_team: 'Uruguay', away_team: 'Cape Verde' },
  { group_name: 'G', match_date: '2026-06-22', match_time: '6:45 AM', venue: 'Vancouver', home_team: 'New Zealand', away_team: 'Egypt' },
  { group_name: 'J', match_date: '2026-06-22', match_time: '10:45 PM', venue: 'Arlington, Texas', home_team: 'Argentina', away_team: 'Austria' },
  // Tuesday, June 23
  { group_name: 'I', match_date: '2026-06-23', match_time: '2:45 AM', venue: 'Philadelphia', home_team: 'France', away_team: 'Iraq' },
  { group_name: 'I', match_date: '2026-06-23', match_time: '5:45 AM', venue: 'East Rutherford, N.J.', home_team: 'Norway', away_team: 'Senegal' },
  { group_name: 'J', match_date: '2026-06-23', match_time: '8:45 AM', venue: 'Santa Clara, Calif.', home_team: 'Jordan', away_team: 'Algeria' },
  { group_name: 'K', match_date: '2026-06-23', match_time: '10:45 PM', venue: 'Houston', home_team: 'Portugal', away_team: 'Uzbekistan' },
  // Wednesday, June 24
  { group_name: 'L', match_date: '2026-06-24', match_time: '1:45 AM', venue: 'Foxborough, Mass.', home_team: 'England', away_team: 'Ghana' },
  { group_name: 'L', match_date: '2026-06-24', match_time: '4:45 AM', venue: 'Toronto', home_team: 'Panama', away_team: 'Croatia' },
  { group_name: 'K', match_date: '2026-06-24', match_time: '7:45 AM', venue: 'Zapopan, Mexico', home_team: 'Colombia', away_team: 'DR Congo' },
  // Thursday, June 25
  { group_name: 'B', match_date: '2026-06-25', match_time: '12:45 AM', venue: 'Vancouver, Canada', home_team: 'Switzerland', away_team: 'Canada' },
  { group_name: 'B', match_date: '2026-06-25', match_time: '12:45 AM', venue: 'Seattle', home_team: 'Bosnia & Herzegovina', away_team: 'Qatar' },
  { group_name: 'C', match_date: '2026-06-25', match_time: '3:45 AM', venue: 'Miami Gardens, Fla.', home_team: 'Scotland', away_team: 'Brazil' },
  { group_name: 'C', match_date: '2026-06-25', match_time: '3:45 AM', venue: 'Atlanta', home_team: 'Morocco', away_team: 'Haiti' },
  { group_name: 'A', match_date: '2026-06-25', match_time: '6:45 AM', venue: 'Mexico City', home_team: 'Czechia', away_team: 'Mexico' },
  { group_name: 'A', match_date: '2026-06-25', match_time: '6:45 AM', venue: 'Guadalupe, Mexico', home_team: 'South Africa', away_team: 'South Korea' },
  // Friday, June 26
  { group_name: 'E', match_date: '2026-06-26', match_time: '1:45 AM', venue: 'East Rutherford, N.J.', home_team: 'Ecuador', away_team: 'Germany' },
  { group_name: 'E', match_date: '2026-06-26', match_time: '1:45 AM', venue: 'Philadelphia', home_team: 'Curacao', away_team: "Cote d'Ivoire" },
  { group_name: 'F', match_date: '2026-06-26', match_time: '4:45 AM', venue: 'Arlington, Texas', home_team: 'Japan', away_team: 'Sweden' },
  { group_name: 'F', match_date: '2026-06-26', match_time: '4:45 AM', venue: 'Kansas City, Mo.', home_team: 'Tunisia', away_team: 'Netherlands' },
  { group_name: 'D', match_date: '2026-06-26', match_time: '7:45 AM', venue: 'Inglewood, Calif.', home_team: 'Turkiye', away_team: 'USA' },
  { group_name: 'D', match_date: '2026-06-26', match_time: '7:45 AM', venue: 'Santa Clara, Calif.', home_team: 'Paraguay', away_team: 'Australia' },
  // Saturday, June 27
  { group_name: 'I', match_date: '2026-06-27', match_time: '12:45 AM', venue: 'Foxborough, Mass.', home_team: 'Norway', away_team: 'France' },
  { group_name: 'I', match_date: '2026-06-27', match_time: '12:45 AM', venue: 'Toronto', home_team: 'Senegal', away_team: 'Iraq' },
  { group_name: 'H', match_date: '2026-06-27', match_time: '5:45 AM', venue: 'Houston', home_team: 'Cape Verde', away_team: 'Saudi Arabia' },
  { group_name: 'H', match_date: '2026-06-27', match_time: '5:45 AM', venue: 'Zapopan, Mexico', home_team: 'Uruguay', away_team: 'Spain' },
  { group_name: 'G', match_date: '2026-06-27', match_time: '8:45 AM', venue: 'Seattle', home_team: 'Egypt', away_team: 'Iran' },
  { group_name: 'G', match_date: '2026-06-27', match_time: '8:45 AM', venue: 'Vancouver, Canada', home_team: 'New Zealand', away_team: 'Belgium' },
  // Sunday, June 28
  { group_name: 'L', match_date: '2026-06-28', match_time: '2:45 AM', venue: 'East Rutherford, N.J.', home_team: 'Panama', away_team: 'England' },
  { group_name: 'L', match_date: '2026-06-28', match_time: '2:45 AM', venue: 'Philadelphia', home_team: 'Croatia', away_team: 'Ghana' },
  { group_name: 'K', match_date: '2026-06-28', match_time: '5:15 AM', venue: 'Miami Gardens, Fla.', home_team: 'Colombia', away_team: 'Portugal' },
  { group_name: 'K', match_date: '2026-06-28', match_time: '5:15 AM', venue: 'Atlanta Stadium', home_team: 'DR Congo', away_team: 'Uzbekistan' },
  { group_name: 'J', match_date: '2026-06-28', match_time: '7:45 AM', venue: 'Kansas City, Mo.', home_team: 'Algeria', away_team: 'Austria' },
  { group_name: 'J', match_date: '2026-06-28', match_time: '7:45 AM', venue: 'Arlington, Texas', home_team: 'Jordan', away_team: 'Argentina' },
]

export type KnockoutFixture = {
  round_name: string
  match_date: string
  match_time: string
  venue: string
  slot_home: number
  slot_away: number
  match_slot: number
}

export const KNOCKOUT_FIXTURES: KnockoutFixture[] = [
  // Round of 32 - Monday, June 29
  { round_name: 'round_of_32', match_date: '2026-06-29', match_time: '12:45 AM', venue: 'Inglewood, Calif.', slot_home: 5, slot_away: 6, match_slot: 35 },
  { round_name: 'round_of_32', match_date: '2026-06-29', match_time: '10:45 PM', venue: 'Houston', slot_home: 17, slot_away: 18, match_slot: 36 },
  // Tuesday, June 30
  { round_name: 'round_of_32', match_date: '2026-06-30', match_time: '2:15 AM', venue: 'Foxborough, Mass.', slot_home: 1, slot_away: 2, match_slot: 33 },
  { round_name: 'round_of_32', match_date: '2026-06-30', match_time: '6:45 AM', venue: 'Guadalupe, Mexico', slot_home: 7, slot_away: 8, match_slot: 36 },
  { round_name: 'round_of_32', match_date: '2026-06-30', match_time: '10:45 PM', venue: 'Arlington, Texas', slot_home: 19, slot_away: 20, match_slot: 43 },
  // Wednesday, July 1
  { round_name: 'round_of_32', match_date: '2026-07-01', match_time: '2:45 AM', venue: 'East Rutherford, N.J.', slot_home: 3, slot_away: 4, match_slot: 34 },
  { round_name: 'round_of_32', match_date: '2026-07-01', match_time: '6:45 AM', venue: 'Mexico City', slot_home: 21, slot_away: 22, match_slot: 44 },
  { round_name: 'round_of_32', match_date: '2026-07-01', match_time: '9:45 PM', venue: 'Atlanta', slot_home: 23, slot_away: 24, match_slot: 44 },
  // Thursday, July 2
  { round_name: 'round_of_32', match_date: '2026-07-02', match_time: '1:45 AM', venue: 'Seattle', slot_home: 15, slot_away: 16, match_slot: 40 },
  { round_name: 'round_of_32', match_date: '2026-07-02', match_time: '5:45 AM', venue: 'Santa Clara, Calif.', slot_home: 13, slot_away: 14, match_slot: 39 },
  // Friday, July 3
  { round_name: 'round_of_32', match_date: '2026-07-03', match_time: '12:45 AM', venue: 'Inglewood, Calif.', slot_home: 11, slot_away: 12, match_slot: 38 },
  { round_name: 'round_of_32', match_date: '2026-07-03', match_time: '4:45 AM', venue: 'Toronto', slot_home: 9, slot_away: 10, match_slot: 37 },
  { round_name: 'round_of_32', match_date: '2026-07-03', match_time: '8:45 AM', venue: 'Vancouver, Canada', slot_home: 29, slot_away: 30, match_slot: 47 },
  { round_name: 'round_of_32', match_date: '2026-07-03', match_time: '11:45 PM', venue: 'Arlington, Texas', slot_home: 27, slot_away: 28, match_slot: 46 },
  // Saturday, July 4
  { round_name: 'round_of_32', match_date: '2026-07-04', match_time: '3:45 AM', venue: 'Miami Gardens, Fla.', slot_home: 25, slot_away: 26, match_slot: 45 },
  { round_name: 'round_of_32', match_date: '2026-07-04', match_time: '7:15 AM', venue: 'Kansas City, Mo.', slot_home: 31, slot_away: 32, match_slot: 48 },
  // Round of 16 - Saturday, July 4
  { round_name: 'round_of_16', match_date: '2026-07-04', match_time: '10:45 PM', venue: 'Houston', slot_home: 35, slot_away: 36, match_slot: 51 },
  // Sunday, July 5
  { round_name: 'round_of_16', match_date: '2026-07-05', match_time: '2:45 AM', venue: 'Philadelphia', slot_home: 33, slot_away: 34, match_slot: 49 },
  // Monday, July 6
  { round_name: 'round_of_16', match_date: '2026-07-06', match_time: '1:45 AM', venue: 'East Rutherford, N.J.', slot_home: 41, slot_away: 42, match_slot: 53 },
  { round_name: 'round_of_16', match_date: '2026-07-06', match_time: '5:45 AM', venue: 'Mexico City', slot_home: 43, slot_away: 44, match_slot: 54 },
  // Tuesday, July 7
  { round_name: 'round_of_16', match_date: '2026-07-07', match_time: '12:45 AM', venue: 'Arlington, Texas', slot_home: 37, slot_away: 38, match_slot: 51 },
  { round_name: 'round_of_16', match_date: '2026-07-07', match_time: '2:45 AM', venue: 'Seattle', slot_home: 39, slot_away: 40, match_slot: 52 },
  { round_name: 'round_of_16', match_date: '2026-07-07', match_time: '9:45 PM', venue: 'Atlanta', slot_home: 45, slot_away: 46, match_slot: 55 },
  // Wednesday, July 8
  { round_name: 'round_of_16', match_date: '2026-07-08', match_time: '1:45 AM', venue: 'Vancouver, Canada', slot_home: 47, slot_away: 48, match_slot: 56 },
  // Quarterfinals - Friday, July 10
  { round_name: 'quarterfinal', match_date: '2026-07-10', match_time: '1:45 AM', venue: 'Foxborough, Mass.', slot_home: 49, slot_away: 50, match_slot: 57 },
  // Saturday, July 11
  { round_name: 'quarterfinal', match_date: '2026-07-11', match_time: '12:45 AM', venue: 'Inglewood, Calif.', slot_home: 51, slot_away: 52, match_slot: 58 },
  // Sunday, July 12
  { round_name: 'quarterfinal', match_date: '2026-07-12', match_time: '2:45 AM', venue: 'Miami Gardens, Fla.', slot_home: 53, slot_away: 54, match_slot: 59 },
  { round_name: 'quarterfinal', match_date: '2026-07-12', match_time: '6:45 AM', venue: 'Kansas City, Mo.', slot_home: 55, slot_away: 56, match_slot: 60 },
  // Semifinals - Wednesday, July 15
  { round_name: 'semifinal', match_date: '2026-07-15', match_time: '12:45 AM', venue: 'TBD', slot_home: 57, slot_away: 58, match_slot: 61 },
  // Thursday, July 16
  { round_name: 'semifinal', match_date: '2026-07-16', match_time: '12:45 AM', venue: 'TBD', slot_home: 59, slot_away: 60, match_slot: 62 },
  // Final - Monday, July 20
  { round_name: 'final', match_date: '2026-07-20', match_time: '12:45 AM', venue: 'TBD', slot_home: 61, slot_away: 62, match_slot: 63 },
]
