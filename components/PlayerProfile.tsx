'use client'

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { TrophyIcon, PodiumIcon } from "./icons"
import type { PlayerProfile, Career } from "@/types"


interface PlayerProfileProps {
  ci: string
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ ci }) => {
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [careerMap, setCareerMap] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfileAndCareers = async () => {
      setLoading(true)
      setError(null)

      try {
        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? ''
        const cleaned = rawApiUrl.replace(/^["']+|["']+$/g, '').trim()
        const apiUrl = cleaned.match(/^https?:\/\//) ? cleaned : `http://${cleaned}`

        // Fetch profile
        const [profileRes, careersRes] = await Promise.allSettled([
          fetch(`${apiUrl}/player/${ci}`),
          // many APIs expose careers at /career or /careers; PlayerRecentMatches used /player to get careers,
          // try /career and fall back to /player
          fetch(`${apiUrl}/career`).catch(() => fetch(`${apiUrl}/player`)),
        ])

        if (profileRes.status === "fulfilled") {
          const res = profileRes.value
          if (res.ok) {
            const json = await res.json()
            // API shape might be { data: ... } or direct object
            const data = json?.data ?? json
            setProfile(data as PlayerProfile)
          } else {
            setError("No se pudo cargar el perfil del jugador.")
          }
        } else {
          setError("Error al solicitar el perfil del jugador.")
        }

        if (careersRes.status === "fulfilled") {
          const res = careersRes.value
          if (res.ok) {
            const json = await res.json()
            const careersData: Career[] = json?.data ?? json ?? []
            const map = new Map<number, string>()
            careersData.forEach((c: Career) => {
              if (c?.career_id != null) map.set(c.career_id, c.name_career)
            })
            setCareerMap(map)
          }
        }
      } catch (err) {
        console.error(err)
        setError("Ocurrió un error al cargar los datos.")
      } finally {
        setLoading(false)
      }
    }

    if (ci) fetchProfileAndCareers()
    else {
      setLoading(false)
      setError("CI de jugador no provisto.")
    }
  }, [ci])

  if (loading) {
    return (
      <section className="bg-[#2A2A3E] p-5 mt-5 rounded-2xl border border-slate-700/50">
        <p className="text-sm text-slate-400">Cargando perfil...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="bg-[#2A2A3E] p-5 mt-5 rounded-2xl border border-slate-700/50">
        <p className="text-sm text-red-500">{error}</p>
      </section>
    )
  }

  if (!profile) {
    return (
      <section className="bg-[#2A2A3E] p-5 mt-5 rounded-2xl border border-slate-700/50">
        <p className="text-sm text-slate-400">Perfil no disponible.</p>
      </section>
    )
  }

  const fullName = `${profile.first_name} ${profile.last_name}`
  const avatar = (profile as any).avatar ?? `/placeholder.svg`
  const careerName = (profile as any).career_name ?? careerMap.get(profile.career_id) ?? "Desconocida"
  const wins = (profile as any).wins ?? 0
  const losses = (profile as any).losses ?? 0
  const aura = profile.aura ?? 0
  const rank = (profile as any).rank ?? 0
  const daysAvailable = profile.Days?.map(d => d.day_id) ?? []

  return (
    <section className="space-y-4">
      <div className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={avatar}
              alt={fullName}
              width={80}
              height={80}
              className="w-20 h-20 rounded-full"
              unoptimized
            />
            <span className="absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center font-bold text-white rounded-full bg-purple-600 border-2 border-[#2A2A3E]">
              #{rank}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{fullName}</h3>
            <p className="text-sm text-slate-400">
              {careerName} • {profile.semester}º Semestre
            </p>
            {/* <p className="text-xs text-slate-400">Tel: {profile.phone}</p> */}
          </div>
        </div>

        <div className="grid grid-cols-3 text-center divide-x divide-slate-700 mt-4">
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

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
            <TrophyIcon className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="font-bold text-white">{(profile as any).tournamentsWon ?? 0}</p>
              <p className="text-xs text-slate-400">Torneos Ganados</p>
            </div>
          </div>
          <div className="bg-slate-800/50 p-3 rounded-lg flex items-center gap-3">
            <PodiumIcon className="w-8 h-8 text-yellow-400" />
            <div>
              <p className="font-bold text-white">{(profile as any).podiums ?? 0}</p>
              <p className="text-xs text-slate-400">Podios</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-white mb-2">Días disponibles</h4>
          <div className="flex justify-center space-x-1">
            {[
              { id: 1, name: "Lun" },
              { id: 2, name: "Mar" },
              { id: 3, name: "Mié" },
              { id: 4, name: "Jue" },
              { id: 5, name: "Vie" },
            ].map((d) => {
              const available = daysAvailable.includes(d.id)
              return (
                <span
                  key={d.id}
                  className={
                    "px-4 py-1 rounded-full text-xs font-medium " +
                    (available
                      ? "bg-green-500 text-white"
                      : "border-b-gray-400 border-2 text-slate-400")
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

export default PlayerProfile