"use client"

import { Button } from "@/components/ui/button"
import { UserCard } from "@/components/user-card"
import { StatCard } from "@/components/stat-card"
import { MatchItem } from "@/components/match-item"
import { TournamentItem } from "@/components/tournament-item"
import { useRouter } from "next/navigation"

// Mock data for demonstration
const mockUser = {
  id: "USR001",
  name: "Ana García López",
  email: "ana.garcia@universidad.edu",
  avatar: "/woman-profile.png",
  career: "Ingeniería de Sistemas",
  semester: "7mo Semestre",
  level: "Avanzado" as const,
}

const mockMatches = [
  {
    opponent: "Carlos Rodríguez",
    result: "Victoria" as const,
    score: "3-1",
    date: "15 Abr 2024",
  },
  {
    opponent: "María Fernández",
    result: "Victoria" as const,
    score: "3-0",
    date: "12 Abr 2024",
  },
  {
    opponent: "Diego Martínez",
    result: "Derrota" as const,
    score: "1-3",
    date: "08 Abr 2024",
  },
  {
    opponent: "Sofía Herrera",
    result: "Victoria" as const,
    score: "3-2",
    date: "05 Abr 2024",
  },
]

const mockTournaments = [
  {
    name: "Torneo Primavera 2024",
    status: "En Curso" as const,
    date: "15 Abr - 30 Abr",
  },
  {
    name: "Copa Universitaria",
    status: "Próximo" as const,
    date: "01 May - 15 May",
  },
  {
    name: "Torneo Invierno 2024",
    status: "Finalizado" as const,
    date: "01 Mar - 15 Mar",
  },
]

export default function PlayerProfile({ params }: { params: { id: string } }) {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Back Button */}
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Rankings
        </Button>

        {/* User Profile Card */}
        <UserCard user={mockUser} />

        {/* Performance Statistics */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Estadísticas de Rendimiento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Victorias"
              value="24"
              icon={
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                </div>
              }
            />

            <StatCard
              title="Partidos Jugados"
              value="32"
              icon={
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              }
            />

            <StatCard
              title="% de Victorias"
              value="75%"
              icon={
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              }
            />

            <StatCard
              title="Partidos Pendientes"
              value="3"
              icon={
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              }
            />
          </div>
        </div>

        {/* Recent Matches */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Partidos Recientes</h2>
          <div className="space-y-4">
            {mockMatches.map((match, index) => (
              <MatchItem
                key={index}
                opponent={match.opponent}
                result={match.result}
                score={match.score}
                date={match.date}
              />
            ))}
          </div>
        </div>

        {/* Participated Tournaments */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Torneos Participados</h2>
          <div className="space-y-4">
            {mockTournaments.map((tournament, index) => (
              <TournamentItem key={index} name={tournament.name} status={tournament.status} date={tournament.date} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
