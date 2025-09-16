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

export interface Day {
  day_id: number;
  day_name: string;
  availabilities: {
    player_ci: string;
    day_id: number;
    createdAt: string;
    updatedAt: string;
  };
}

export interface PlayerBackendResponse {
  ci: string;
  first_name: string;
  last_name: string;
  phone: string;
  semester: number;
  career_id: number;
  aura: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  Days: Day[];
}

export interface PlayerProfile extends PlayerBackendResponse {
  career_name: string;
  avatar: string;
  wins: number;
  losses: number;
  tournamentsWon: number;
  podiums: number;
  rank: number;
}

export interface Tournament {
  tournament_id?: number
  name: string
  description?: string | null
  tournament_type: 'Individual' | 'Dobles'
  format: string
  start_date: Date
  end_date?: Date | null
  status: 'Próximo' | 'En Curso' | 'Finalizado' | 'Cancelado'
  createdAt?: Date
  updatedAt?: Date
}

export interface Match {
  match_id?: number;
  tournament_id: number;
  inscription1_id: number;
  inscription2_id: number;
  winner_inscription_id?: number | null;
  match_datetime?: Date | null;
  round: string;
  status?: 'Pendiente' | 'En Juego' | 'Finalizado';
  createdAt?: Date;
  updatedAt?: Date;
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

export interface Career {
  career_id: number
  name_career: string
}