export interface Player {
  id: number
  name: string
  avatar: string
  rank?: number
  rating: number
  major: string
  semester?: string
  weeklyChange?: number
  wins?: number
  losses?: number
}

export interface Tournament {
  id: number
  name: string
  type: "Individual" | "Dobles" | "Dobles Mixto"
  participants: number
  status: "En Curso" | "Cuartos" | "Próximo"
  stage: string
  progress: number
  players: Player[]
}

export interface Match {
  id: number
  player1: Player
  player2: Player
  score1: number
  score2: number
  tournamentName: string
  timeAgo: string
  sets: { p1: number; p2: number }[]
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
