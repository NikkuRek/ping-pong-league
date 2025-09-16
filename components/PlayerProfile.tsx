import React from "react"
import { notFound } from "next/navigation"
import { TrophyIcon, PodiumIcon } from "../components/icons"

type Player = {
  ci: string
  name: string
  avatar?: string
  major?: string
  semester?: number | string
  aura?: number
  wins?: number
  losses?: number
  tournamentsWon?: number
  podiums?: number
  rank?: number
  days?: number[]
}

import { calculatePlayerRank } from "../lib/playerRank"

async function fetchPlayer(ci: string): Promise<Player | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/player/${ci}`)
    if (!res.ok) return null
    const body = await res.json()

    // La API responde { message, data: { ... } }
    const data = body?.data
    if (!data) return null

    // Obtener días
    const days: number[] = Array.isArray(data.Days)
      ? data.Days.map((d: any) => d.day_id).filter((id: any) => typeof id === "number")
      : []

    // Obtener nombre de la carrera haciendo un GET a la API de career
    let major = "—"
    if (data.career_id) {
      try {
        const careerRes = await fetch(`http://localhost:3000/api/career/${data.career_id}`)
        if (careerRes.ok) {
          const careerBody = await careerRes.json()
          const careerData = careerBody?.data
          // Adaptarse a distintos shapes: name_career, name o career_name
          major =
            careerData?.name_career ??
            careerData?.name ??
            careerData?.career_name ??
            `Carrera ${data.career_id}`
        } else {
          major = `Carrera ${data.career_id}`
        }
      } catch {
        major = `Carrera ${data.career_id}`
      }
    }

    const playerAura = Number(data.aura ?? data.Aura ?? 0) || 0

    const rank = await calculatePlayerRank(playerAura)

    return {
      ci: data.ci,
      name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim() || data.ci,
      avatar: "https://picsum.photos/seed/player1/96/96",
      major,
      semester: data.semester ?? "—",
      aura: playerAura,
      wins: 0,
      losses: 0,
      tournamentsWon: 0,
      podiums: 0,
      rank,
      days,
    }
  } catch {
    return null
  }
}

export default async function Page({ params }: { params: { ci: string } }) {
  const { ci } = params
  const player = await fetchPlayer(ci)

  if (!player) {
    // If you prefer a custom error UI you can return JSX instead
    notFound()
  }

  const {
    name,
    avatar,
    major = "—",
    semester = "—",
    aura = 0,
    wins = 0,
    losses = 0,
    tournamentsWon = 0,
    podiums = 0,
    rank = 0,
    days = [],
  } = player!

  return (
    <section>
      <div className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50 space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={avatar || "/placeholder.svg"} alt={name} className="w-20 h-20 rounded-full" />
            <span className="absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center font-bold text-white rounded-full bg-purple-600 border-2 border-[#2A2A3E]">
              #{rank}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{name}</h3>
            <p className="text-sm text-slate-400">
              {major} • {semester} Semestre
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 text-center divide-x divide-slate-700">
          <div>
            <p className="text-2xl font-bold text-purple-400">{aura}</p>
            <p className="text-xs text-slate-400">Aura</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{wins}</p>
            <p className="text-xs text-slate-400">Victorias</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{losses}</p>
            <p className="text-xs text-slate-400">Derrotas</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="font-bold text-white">{tournamentsWon}</p>
              <p className="text-xs text-slate-400">Torneos Ganados</p>
            </div>
          </div>

          <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
            <PodiumIcon className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="font-bold text-white">{podiums}</p>
              <p className="text-xs text-slate-400">Podios</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Días disponibles</h4>
          <div className="flex justify-center space-x-4">
            {[
              { id: 1, name: "Lun" },
              { id: 2, name: "Mar" },
              { id: 3, name: "Mié" },
              { id: 4, name: "Jue" },
              { id: 5, name: "Vie" },
            ].map((d) => {
              const available = days.includes(d.id)
              return (
                <span
                  key={d.id}
                  className={
                    "px-4 py-1 rounded-full text-xs font-medium " +
                    (available ? "bg-green-500 text-white" : "border-b-gray-400 border-2 text-slate-400")
                  }
                >
                  {d.name}
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}