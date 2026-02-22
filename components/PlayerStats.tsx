"use client"

import React, { useMemo } from "react"
import { usePlayerMatches } from "@/hooks/usePlayerMatches"
import { usePlayerProfile } from "@/hooks/usePlayerProfile"
import { useAuraRecords } from "@/hooks/useAuraRecords"
import { calculateExtendedStats } from "@/lib/statsUtils"
import { 
  Flame, Target, Trophy, TrendingUp, Zap, 
  UserMinus, UserPlus, Calendar, Timer, Award 
} from "lucide-react"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts"

interface PlayerStatsProps {
  playerId: string
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ playerId }) => {
  const { matches, loading: matchesLoading } = usePlayerMatches(playerId)
  const { profile, rank, totalPlayers, loading: profileLoading } = usePlayerProfile(playerId)
  const { records, loading: recordsLoading } = useAuraRecords(playerId)
  const [selectedTournament, setSelectedTournament] = React.useState<string>("Global")

  const stats = useMemo(() => {
    if (matchesLoading || recordsLoading) return null
    return calculateExtendedStats(matches, records, profile)
  }, [matches, records, profile, matchesLoading, recordsLoading])

  if (matchesLoading || profileLoading || recordsLoading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-400 animate-pulse">Analizando rendimiento...</p>
      </div>
    )
  }

  if (!stats) return null

  const tournaments = ["Global", ...Object.keys(stats.winLossByTournament)]
  
  const currentWinrateStats = selectedTournament === "Global" 
    ? { 
        won: stats.totalWon, 
        lost: stats.totalLost, 
        played: stats.totalWon + stats.totalLost,
        ratio: stats.winLossRatio 
      }
    : stats.winLossByTournament[selectedTournament]

  const percentile = totalPlayers > 0 
    ? (100 - ((rank - 0.5) / totalPlayers * 100)).toFixed(0) 
    : "0"

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Ranking y Estatus */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 p-5 rounded-2xl border border-purple-500/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-purple-300 font-bold mb-1">Ranking Relativo</p>
            <h3 className="text-2xl font-black text-white"># {rank} <span className="text-sm font-normal text-slate-400">de {totalPlayers}</span></h3>
          </div>
          <div className="text-right">
            <span className="bg-purple-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase">Por encima del {percentile}% de jugadores</span>
          </div>
        </div>

        <div className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Actividad Reciente</p>
            <h3 className="text-2xl font-black text-white">{stats.monthlyMatchCount} <span className="text-sm font-normal text-slate-400">partidos</span></h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-white font-bold">{stats.daysSinceLastMatch ?? "—"} días</p>
            <p className="text-[10px] text-slate-500 uppercase">desde el último</p>
          </div>
        </div>
      </section>

      {/* Nuevo: Desglose de Winrate */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Winrate
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filtrar:</span>
            <select 
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="bg-[#1e1e2e] border border-slate-700 text-slate-300 text-xs rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-1.5 outline-none"
            >
              {tournaments.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#2A2A3E]/60 p-5 rounded-2xl border border-slate-700/30 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Ganados</p>
            <p className="text-3xl font-black text-green-400">{currentWinrateStats.won}</p>
          </div>
          <div className="bg-[#2A2A3E]/60 p-5 rounded-2xl border border-slate-700/30 text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">Perdidos</p>
            <p className="text-3xl font-black text-red-400">{currentWinrateStats.lost}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 p-5 rounded-2xl border border-purple-500/30 text-center">
            <p className="text-[10px] uppercase tracking-wider text-purple-300 font-bold mb-1">Winrate</p>
            <p className="text-3xl font-black text-white">{currentWinrateStats.ratio}%</p>
          </div>
        </div>
      </section>

      {/* 2. Rendimiento General (Snapshot) */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Rendimiento
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard 
            label="Racha Actual" 
            value={stats.currentStreak.count > 0 ? `${stats.currentStreak.count} ${stats.currentStreak.type === "win" ? "Victorias" : "Derrotas"}` : "—"} 
            icon={Flame} 
            color={stats.currentStreak.type === "win" ? "text-orange-500" : "text-slate-400"} 
          />
          <StatCard 
            label="Estado de Forma" 
            value={
              <div className="flex gap-1.5 m-2  items-center">
                {stats.last5Results.map((r, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center justify-center w-5 h-5 text-[10px] font-bold transition-all
                      ${r === 'win' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                      ${i === 0 
                        ? ' rounded-full' 
                        : ' rounded-sm'
                      }`}
                  >
                    {r === 'win' ? 'V' : 'D'}
                  </div>
                ))}
              </div>
            } 
            icon={Zap} 
            color="text-yellow-400" 
            subValue="Últimos 5 partidos"
          />
          <StatCard 
            label="Variación Semanal" 
            value={`${stats.weeklyEloVariation >= 0 ? '+' : ''}${stats.weeklyEloVariation}`} 
            icon={TrendingUp} 
            color={stats.weeklyEloVariation >= 0 ? "text-green-400" : "text-red-400"} 
            subValue="Aura vs Lunes pasado"
          />
          <StatCard 
            label="Puntos Ganados" 
            value={stats.totalPointsWon} 
            icon={Target} 
            color="text-green-400" 
            subValue={`vs ${stats.totalPointsLost} perdidos`}
          />
        </div>

        {/* Aura Chart */}
        <div className="bg-[#2A2A3E] p-6 rounded-2xl border border-slate-700/50">
          <h4 className="text-sm font-medium text-slate-400 mb-6">Evolución del Aura (Últimos 20 registros)</h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.eloEvolution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id={`colorAura-${playerId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                <XAxis 
                  dataKey="recordLabel" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                  interval={0}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  domain={['dataMin - 100', 'dataMax + 100']}
                  dx={-10}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      const displayValue = isNaN(Number(value)) ? "—" : String(value);
                      return (
                        <div className="bg-[#1e1e2e]/95 backdrop-blur-md border border-slate-700 p-3 rounded-lg shadow-2xl border-l-4 border-l-purple-500">
                          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1">
                            {payload[0].payload.fullDate}
                          </p>
                          <p className="text-sm font-bold text-white">
                            Aura: <span className="text-purple-400 font-black">{displayValue}</span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="aura" 
                  stroke="#a78bfa" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill={`url(#colorAura-${playerId})`} 
                  connectNulls={true}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* 4. Eficiencia de Sets y Dominio */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Eficiencia y Dominio
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricRow 
            label="Índice de Sets Ganados" 
            value={stats.setsWonAverage} 
            description="Promedio de sets ganados por partido jugado." 
          />
          <MetricRow 
            label="Juegos Barridos" 
            value={stats.cleanSweeps} 
            description="Partidos ganados sin perder ni un solo set." 
          />
          <MetricRow 
            label="Juegos en Deuce" 
            value={stats.deuceSetsWonCount} 
            description="Juegos ganados por diferencia de puntos (llegaron al 10-10)." 
          />
          <MetricRow 
            label="Remontadas" 
            value={stats.comebacks} 
            description="Partidos ganados tras estar a 1 set de perder" 
          />
        </div>
      </section>

      {/* 5. Análisis de Rivales */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          Análisis de Rivales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <OpponentCard 
            title="Némesis" 
            name={stats.nemesis?.name || "N/A"} 
            sub={`WR: ${stats.nemesis?.ratio || 0}%`}
            icon={UserMinus}
            iconColor="text-red-400"
          />
          <OpponentCard 
            title="Rival" 
            name={stats.customer?.name || "N/A"} 
            sub={`${stats.customer?.wins || 0} victorias`}
            icon={UserPlus}
            iconColor="text-green-400"
          />
        </div>
      </section>

      {/* 6. Hitos y Récords */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-400" />
          Hitos y Récords
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Asistencia Anual</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-white">{stats.attendance.yearly}</span>
                <span className="text-xs text-slate-500 font-medium">torneos este año</span>
              </div>
            </div>
          </div>

          <div className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Partido más largo</p>
            </div>
            {stats.longestMatch ? (
              <div>
                <p className="text-white font-bold">{stats.longestMatch.points} puntos totales</p>
                <p className="text-xs text-slate-500">vs {stats.longestMatch.opponent} ({stats.longestMatch.sets} sets)</p>
              </div>
            ) : (
              <p className="text-slate-500 text-sm italic">Sin datos registrados</p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

const StatCard = ({ label, value, icon: Icon, color, subValue }: any) => (
  <div className="bg-[#2A2A3E] p-4 rounded-2xl border border-slate-700/50 flex flex-col gap-2 relative overflow-hidden group">
    <div className={`p-2 rounded-lg bg-slate-800/50 w-fit ${color} group-hover:scale-110 transition-transform`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</p>
      <p className="text-lg font-bold text-white truncate">{value}</p>
      {subValue && <p className="text-[10px] text-slate-400 mt-0.5">{subValue}</p>}
    </div>
  </div>
)

const MetricRow = ({ label, value, description }: any) => (
  <div className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50 flex items-center justify-between gap-6">
    <div className="flex-1">
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
    <div className="text-right">
      <p className="text-2xl font-black text-purple-400">{value}</p>
    </div>
  </div>
)

const OpponentCard = ({ title, name, sub, icon: Icon, iconColor }: any) => (
  <div className="bg-[#2A2A3E] p-4 rounded-2xl border border-slate-700/50 flex items-center gap-4">
    <div className={`p-3 rounded-xl bg-slate-800/50 ${iconColor}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{title}</p>
      <p className="text-sm font-bold text-white truncate">{name}</p>
      <p className="text-[11px] text-slate-400">{sub}</p>
    </div>
  </div>
)

export default PlayerStats

