"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { usePlayerMatches } from "@/hooks/usePlayerMatches"
import type { PlayerProfile as PlayerProfileType, Career } from "@/types"
import { getApiUrl } from "@/lib/api-config"
import RemainingMatches from "./RemainingMatches"
import { usePlayerBadges } from "@/hooks/usePlayerBadges"
import { PlayerBadge } from "./PlayerBadge"
import { usePlayerProfile } from "@/hooks/usePlayerProfile"

interface PlayerProfileProps {
  ci: string
}

/**
 * Normaliza y construye la URL base de la API a partir de variables de entorno.
 */
function getApiBase(): string {
  return getApiUrl()
}

// usePlayerProfile logic was moved to @/hooks/usePlayerProfile.ts

const parseNumber = (v: any) => {
  const n = Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ ci }) => {
  const { profile, careerMap, wins, losses, rank, rawMatches, loading, error } = usePlayerProfile(ci)
  const { badges, loading: badgesLoading } = usePlayerBadges(ci, rawMatches || [], profile)
  const [copied, setCopied] = useState(false)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-600 border-t-purple-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Cargando datos...</p>
      </div>
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
  const avatar = (profile as any).avatar || `https://api.dicebear.com/9.x/avataaars/svg?seed=${ci}`
  const careerName = (profile as any).career_name ?? careerMap.get(profile.career_id) ?? "Desconocida"
  const aura = profile.aura ?? 0
  const daysAvailable = profile.Days?.map((d: any) => d.day_id) ?? []

  // Prioriza los wins/loses computados; si no están listos usa campos del profile o 0.
  const winsDisplay =
    wins != null
      ? wins
      : parseNumber((profile as any).wins ?? (profile as any).victories ?? (profile as any).wins_total ?? 0)
  const lossesDisplay =
    losses != null
      ? losses
      : parseNumber((profile as any).losses ?? (profile as any).defeats ?? (profile as any).losses_total ?? 0)

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
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{fullName}</h3>
            <p className="text-sm text-slate-400 mt-1">
              {careerName} • {profile.semester}º Semestre
            </p>

            {profile.phone && (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-slate-400">
                  Teléfono: {profile.phone}
                </p>
                <div className="relative flex items-center gap-2">
                  <button
                    onClick={() => {
                      const formattedPhone = profile.phone.startsWith('0')
                        ? `+58 ${profile.phone.slice(1)}`
                        : profile.phone
                      navigator.clipboard.writeText(formattedPhone)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    className="text-slate-400 hover:text-white transition-all p-1 rounded hover:bg-slate-700/50 active:scale-90"
                    title="Copiar teléfono"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                  </button>
                  {copied && (
                    <span className="text-xs text-emerald-400 font-medium animate-fade-in">
                      ¡Copiado!
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="ml-auto mr-5">
            <RemainingMatches ci={ci} />
          </div>
        </div>

        <div className="mt-4">
          {/* Badges */}
          {!badgesLoading && badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {badges.map((badge: any) => (
                <PlayerBadge key={badge.id} badge={badge} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-semibold text-white mb-2">Días disponibles</h4>
          <div className="flex justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((d) => {
              const available = daysAvailable.includes(d)
              return (
                <span
                  key={d}
                  className={
                    "px-4 py-1 rounded-full text-xs font-medium " +
                    (available ? "bg-emerald-500 text-white" : "border-b-gray-400 border-2 text-slate-400")
                  }
                >
                  {d === 1 ? "Lun" : d === 2 ? "Mar" : d === 3 ? "Mié" : d === 4 ? "Jue" : "Vie"}
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
