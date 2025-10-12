import type React from "react"
import { UsersIcon, TrophyIcon, GameIcon } from "./icons"

interface AdminCardProps {
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

const AdminCard: React.FC<AdminCardProps> = ({ title, description, icon, color }) => (
  <div className="bg-[#2A2A3E] p-6 rounded-2xl border border-slate-700/50 flex flex-col items-start gap-4 hover:border-purple-500 transition-colors cursor-pointer">
    <div className={`p-3 rounded-lg bg-gradient-to-br ${color}`}>{icon}</div>
    <div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
  </div>
)

const ActivityBar: React.FC<{ label: string; value: number; color: string; percentage: number }> = ({
  label,
  value,
  color,
  percentage,
}) => (
  <div className="flex items-center gap-4">
    <p className="text-sm text-slate-400 w-24 shrink-0">{label}</p>
    <div className="w-full bg-slate-700 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
    </div>
    <p className="text-sm font-semibold text-white w-8 text-right">{value}</p>
  </div>
)

const AdminPanel: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminCard
          title="Jugadores"
          description="Gestionar perfiles"
          icon={<UsersIcon className="w-8 h-8 text-white" />}
          color="from-purple-500 to-cyan-500"
        />
        <AdminCard
          title="Torneos"
          description="Crear y editar"
          icon={<TrophyIcon className="w-8 h-8 text-white" />}
          color="from-purple-500 to-pink-500"
        />
        <AdminCard
          title="Partidos"
          description="Resultados"
          icon={<GameIcon className="w-8 h-8 text-white" />}
          color="from-green-500 to-teal-500"
        />
        <AdminCard
          title="Equipos"
          description="Gestionar grupos"
          icon={<UsersIcon className="w-8 h-8 text-white" />}
          color="from-sky-500 to-indigo-500"
        />
      </div>

      <section>
        <h2 className="text-2xl font-bold text-white mb-6">Estadísticas del Sistema</h2>

        <div className="bg-[#2A2A3E] p-6 rounded-2xl border border-slate-700/50 mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Resumen Mensual</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-5xl font-bold text-purple-400">156</p>
              <p className="text-slate-400">Partidos Jugados</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-green-400">8</p>
              <p className="text-slate-400">Torneos Completados</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2A2A3E] p-6 rounded-2xl border border-slate-700/50">
          <h3 className="text-lg font-bold text-white mb-4">Actividad por Carrera</h3>
          <div className="space-y-4">
            <ActivityBar label="Ing. Software" value={85} percentage={85} color="bg-purple-500" />
            <ActivityBar label="Ing. Industrial" value={62} percentage={62} color="bg-purple-500" />
            <ActivityBar label="Ing. Civil" value={48} percentage={48} color="bg-green-500" />
            <ActivityBar label="Ing. Sistemas" value={35} percentage={35} color="bg-pink-500" />
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminPanel
