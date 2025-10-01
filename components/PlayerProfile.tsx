'use client'

import React, { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { TrophyIcon, PodiumIcon } from "./icons"
import { usePlayerMatches } from "@/hooks/usePlayerMatches"
import type { PlayerProfile as PlayerProfileType, Career } from "@/types"

interface PlayerProfileProps {
  ci: string
}

/**
 * Normaliza y construye la URL base de la API a partir de variables de entorno.
 */
function getApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? ""
  const cleaned = raw.replace(/^["']+|["']+$/g, "").trim()
  if (!cleaned) return ""
  return cleaned.match(/^https?:\/\//) ? cleaned : `http://${cleaned}`
}

/**
 * Hook que encapsula toda la lógica de carga de perfil, carreras y cálculo de victorias/derrotas.
 */
function usePlayerProfile(ci: string) {
  const [profile, setProfile] = useState<PlayerProfileType | null>(null)
  const [careerMap, setCareerMap] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const {
    matches,
    loading: matchesLoading,
    error: matchesError,
  } = usePlayerMatches(ci)

  const apiBase = useMemo(() => getApiBase(), [])

  useEffect(() => {
    if (!ci) {
      setError("CI de jugador no provisto.")
      setLoading(false)
      return
    }
    if (!apiBase) {
      setError("URL de API no configurada.")
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const signal = controller.signal

    async function fetchProfileAndCareers() {
      setLoading(true)
      setError(null)

      try {
        const profileResPromise = fetch(`${apiBase}/player/${ci}`, { signal }).catch((e) => {
          if (e.name === "AbortError") throw e
          return null
        })

        const careersResPromise = (async () => {
          try {
            const r = await fetch(`${apiBase}/career`, { signal })
            if (r.ok) return r
            return await fetch(`${apiBase}/player`, { signal })
          } catch (e) {
            if ((e as any).name === "AbortError") throw e
            return null
          }
        })()

        const [profileRes, careersRes] = await Promise.all([
          profileResPromise,
          careersResPromise,
        ])

        if (!profileRes) {
          setError("No se pudo obtener el perfil del jugador.")
          setProfile(null)
        } else if (!profileRes.ok) {
          setError("No se pudo cargar el perfil del jugador.")
          setProfile(null)
        } else {
          const json = await profileRes.json()
          const data = json?.data ?? json
          setProfile(data as PlayerProfileType)
        }

        if (careersRes && careersRes.ok) {
          const json = await careersRes.json()
          const careersData: Career[] = json?.data ?? json ?? []
          const map = new Map<number, string>()
          careersData.forEach((c) => {
            if (c?.career_id != null) map.set(c.career_id, c.name_career)
          })
          setCareerMap(map)
        }
      } catch (err: any) {
        if (err.name === "AbortError") return
        console.error(err)
        setError("Ocurrió un error al cargar los datos.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfileAndCareers()

    return () => {
      controller.abort()
    }
  }, [ci, apiBase])

  const wins = useMemo(() => {
    if (!matches) return 0
    return matches.reduce((acc, m) => (m.result === "win" ? acc + 1 : acc), 0)
  }, [matches])

  const losses = useMemo(() => {
    if (!matches) return 0
    return matches.reduce((acc, m) => (m.result === "loss" ? acc + 1 : acc), 0)
  }, [matches])

  return {
    profile,
    careerMap,
    wins,
    losses,
    loading: loading || matchesLoading,
    error: error ?? matchesError?.message,
  }
}

const parseNumber = (v: any) => {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ ci }) => {
  const { profile, careerMap, wins, losses, loading, error } = usePlayerProfile(ci)

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
  const avatar = (profile as any).avatar ?? `https://picsum.photos/seed/player1/40/40`
  const careerName = (profile as any).career_name ?? careerMap.get(profile.career_id) ?? "Desconocida"
  const aura = profile.aura ?? 0
  const rank = (profile as any).rank ?? 0
  const daysAvailable = profile.Days?.map((d: any) => d.day_id) ?? []

  // Prioriza los wins/loses computados; si no están listos usa campos del profile o 0.
  const winsDisplay = wins != null ? wins : parseNumber((profile as any).wins ?? (profile as any).victories ?? (profile as any).wins_total ?? 0)
  const lossesDisplay = losses != null ? losses : parseNumber((profile as any).losses ?? (profile as any).defeats ?? (profile as any).losses_total ?? 0)

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
            {/* <span className="absolute bottom-0 right-0 w-8 h-8 flex items-center justify-center font-bold text-white rounded-full bg-purple-600 border-2 border-[#2A2A3E]">
              #{rank}
            </span> */}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{fullName}</h3>
            <p className="text-sm text-slate-400">
              {careerName} • {profile.semester}º Semestre
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 text-center divide-x divide-slate-700 mt-4">
        {/* <div className="grid grid-cols-3 text-center divide-x divide-slate-700 mt-4"> */}
          {/* <div>
            <p className="text-2xl font-bold text-purple-400">{aura}</p>
            <p className="text-xs text-slate-400">Aura</p>
          </div> */}
          <div>
            <p className="text-2xl font-bold text-green-400">{winsDisplay}</p>
            <p className="text-xs text-slate-400">Victorias</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{lossesDisplay}</p>
            <p className="text-xs text-slate-400">Derrotas</p>
          </div>
        </div>

        {/* <div className="grid grid-cols-2 gap-3 mt-4">
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
        </div> */}

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