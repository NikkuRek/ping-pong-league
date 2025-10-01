export interface FormattedSet {
  p1: number; // Score for the current player
  p2: number; // Score for the opponent
}

export interface MatchData {
  player1Ci: string;
  player2Ci: string;
  id: string;
  player1Name: string; // Current player's name
  player1Avatar: string; // Current player's avatar (placeholder for now)
  player2Name: string; // Opponent's name
  player2Avatar: string; // Opponent's avatar (placeholder for now)
  score1: number; // Current player's total sets won
  score2: number; // Opponent's total sets won
  tournamentName: string; // Placeholder for now
  timeAgo: string; // Derived from match_datetime
  sets: FormattedSet[]; // Individual set scores
  result: string;
}

export interface TournamentDetails {
  tournament_id: number;
  name: string;
  // ... other fields if needed
}
