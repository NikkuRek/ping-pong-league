export interface FormattedSet {
  p1: number
  p2: number
}

export interface MatchData {
  player1Ci: string
  player2Ci: string
  id: string
  player1Name: string
  player1Avatar: string
  player2Name: string
  player2Avatar: string
  score1: number
  score2: number
  tournamentName: string
  timeAgo: string
  sets: FormattedSet[]
  result: string
}

export interface TournamentDetails {
  tournament_id: number
  name: string
}
