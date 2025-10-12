export interface Player {
  ci: string
  first_name: string
  last_name: string
  phone: string
  semester: number
  career_id: number
  aura?: number
  status: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Career {
  career_id: number
  name_career: string
}

export interface Day {
  day_id: number
  day_name: string
  availabilities: {
    player_ci: string
    day_id: number
    createdAt: string
    updatedAt: string
  }
}

export interface PlayerBackendResponse {
  ci: string
  first_name: string
  last_name: string
  phone: string
  semester: number
  career_id: number
  aura: number
  status: boolean
  createdAt: string
  updatedAt: string
  Days: Day[]
}

export interface PlayerProfile extends PlayerBackendResponse {
  career_name: string
  avatar: string
  wins: number
  losses: number
}

export interface Tournament {
  tournament_id: number
  name: string
  description: string | null
  tournament_type: "Individual" | "Dobles"
  format: string
  start_date: string
  end_date: string | null
  status: "Próximo" | "En Curso" | "Finalizado" | "Cancelado"
  createdAt: string
  updatedAt: string
}

export interface Set {
  set_id: number
  match_id: number
  set_number: number
  score_participant1: number
  score_participant2: number
  createdAt: string
  updatedAt: string
}

export interface FormattedSet {
  p1: number
  p2: number
}

export interface Match {
  match_id: number
  tournament_id: number
  inscription1_id: number
  inscription2_id: number
  winner_inscription_id: number | null
  match_datetime: string
  round: string
  status: string
  createdAt: string
  updatedAt: string
  sets: Set[]
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
  result: "win" | "loss" | "no-result" // Added "no-result" to handle matches without valid winners
  winnerInscriptionId: number | null
  playerInscriptionId: number
  opponentInscriptionId: number
}

export interface Inscription {
  inscription_id: number
  tournament_id: number
  player_ci: string
  team_id: null | number
  inscription_date: string
  seed: null | number
  createdAt: string
  updatedAt: string
  player: Player // This Player type should be the one from the API response, not the local one.
  team: null
  tournament: Tournament
}

export interface UpcomingTournament {
  id: number
  name: string
  date: string
  day: string
  month: string
  type: string
  details: string
  slots: number
  registered: number
  time: string
}

export interface TournamentDetails {
  tournament_id: number
  name: string
}

export type PlayerForList = {
  ci: string
  first_name: string
  last_name: string
  avatar?: string | null
  career_name: string
  aura?: string | number
  semester: number
  Days?: Day[]
}

export interface WelcomeData {
  playerCount: number
  activeTournamentsCount: number
  loading: boolean
  error: Error | null
}

export interface TournamentStanding {
  player_ci: string
  player_name: string
  matches_played: number // JJ
  matches_won: number // JG
  matches_lost: number // JP
  sets_won: number // SG
  points: number // Pts (3 per win, 1 per loss with at least 1 set won, 0 otherwise)
  points_for: number // Pts. F (total points scored in all sets)
  points_against: number // Pts. C (total points received in all sets)
  difference: number // Dif (points_for - points_against)
}

export interface TournamentDetail extends Tournament {
  inscriptions?: Inscription[]
  matches?: Match[]
}
