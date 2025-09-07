import { StatCard } from "@/components/stat-card"
import { LevelCard } from "@/components/level-card"
import { TournamentModeCard } from "@/components/tournament-mode-card"

export function DashboardView() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Panel de Control General</h1>
        <p className="text-muted-foreground">Resumen de métricas clave del sistema</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Usuarios"
          value="248"
          icon={
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
          }
        />

        <StatCard
          title="Torneos Activos"
          value="12"
          icon={
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          title="Partidos Completados"
          value="1,847"
          icon={
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          title="Partidos Pendientes"
          value="89"
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
      </div>

      {/* Detailed Statistics Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Estadísticas Detalladas</h2>

        {/* Distribution by Levels */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Distribución por Niveles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LevelCard level="Principiantes" count={142} color="green" />
            <LevelCard level="Intermedios" count={78} color="yellow" />
            <LevelCard level="Avanzados" count={28} color="pink" />
          </div>
        </div>

        {/* Tournament Modalities */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Modalidades de Torneos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TournamentModeCard mode="Amistosos" count={8} color="light-green" />
            <TournamentModeCard mode="Competitivos" count={4} color="pink" />
          </div>
        </div>
      </div>
    </div>
  )
}
