'use client'

import React, { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { Skeleton } from "./ui/skeleton"
// Asegúrate de que este tipo sea correcto
import type { PlayerBackendResponse as PlayerDetails } from "@/types"

// Se asume que ApiMatch es un objeto que tiene al menos las propiedades normalizadas
// Ahora se asemeja al formato del hook de recientes.
type ApiMatch = {
    id: string | number;
    player1Ci: string;
    player2Ci: string;
    player1Name: string;
    player2Name: string;
    player1Avatar: string;
    player2Avatar: string;
    score1: number;
    score2: number;
    tournamentName: string;
    timeAgo: string;
    finalized: boolean; // Usado para el filtro, debe ser `false`
    sets: { p1: number, p2: number }[]; // Añadido para mantener consistencia con el componente de recientes
}

// Se asume que estos tipos existen en tu archivo "@/types"
type Career = { career_id: number; name_career: string }; 


// --- Funciones de utilidad ---

const cleanApiUrl = (raw: string | undefined) => {
  const rawApiUrl = raw ?? ''
  const cleaned = rawApiUrl.replace(/^["']+|["']+$/g, '').trim()
  return cleaned.match(/^https?:\/\//) ? cleaned : `http://${cleaned}`
}

const field = (obj: any, ...keys: string[]) => {
  for (const k of keys) {
    if (obj == null) continue
    if (k.includes('?.')) {
        const [parentKey, childKey] = k.split('?.')
        const parent = obj[parentKey]
        if (parent && parent[childKey] !== undefined) return parent[childKey]
    }
    const v = obj[k]
    if (v !== undefined) return v
  }
  return undefined
}

const timeAgoFrom = (iso?: string) => {
  if (!iso) return ""
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `Hace ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Hace ${hours} horas`
    const days = Math.floor(hours / 24)
    return `Hace ${days} días`
  } catch {
    return ""
  }
}


// --- Componente principal ---

const UpcomingMatches: React.FC<{ ci: string }> = ({ ci: playerId }) => {
  // Renombramos 'ci' a 'playerId' para acoplarlo al estilo del componente de recientes
  const [matches, setMatches] = useState<ApiMatch[]>([])
  const [loading, setLoading] = useState(true) // Loading de la lista de matches
  const [error, setError] = useState<string | null>(null)

  // Estados para la información complementaria, siguiendo el patrón de recientes
  const [playerDetailsMap, setPlayerDetailsMap] = useState<Map<string, PlayerDetails>>(new Map())
  const [careerMap, setCareerMap] = useState<Map<number, string>>(new Map())
  const [loadingPlayerDetails, setLoadingPlayerDetails] = useState(true)
  const [loadingCareers, setLoadingCareers] = useState(true)
  const fetchedCisRef = useRef<Set<string>>(new Set());


  // 1. Fetch Matches (Adaptado para el endpoint "/match" y filtrado por status NO "Finalizado")
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true)
      setError(null)
      try {
        const apiUrl = cleanApiUrl(process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL)
        const url = `${apiUrl}/match`
        
        const res = await fetch(url)
        if (!res.ok) throw new Error("No se pudo obtener la lista de partidos desde la API")
        
        const json = await res.json()
        const data = Array.isArray(json) ? json : json.data ?? json.matches ?? []

        // Normalización y filtrado:
        const normalized: ApiMatch[] = (data as any[]).map((m: any) => {
          return {
            id: field(m, "match_id", "id"),
            // Usamos inscription_id como CI/ID del jugador si no hay nada más específico
            player1Ci: String(field(m, "player1Ci", "player1_ci", "player1?.ci", "player1Id", "inscription1_id") ?? ''),
            player2Ci: String(field(m, "player2Ci", "player2_ci", "player2?.ci", "player2Id", "inscription2_id") ?? ''),
            player1Name: field(m, "player1Name", "player1_name", "player1?.name") ?? 'Jugador 1',
            player2Name: field(m, "player2Name", "player2_name", "player2?.name") ?? 'Jugador 2',
            player1Avatar: field(m, "player1Avatar", "player1_avatar", "player1?.avatar") ?? '',
            player2Avatar: field(m, "player2Avatar", "player2_avatar", "player2?.avatar") ?? '',
            score1: field(m, "score1", "s1") ?? 0,
            score2: field(m, "score2", "s2") ?? 0,
            tournamentName: field(m, "tournamentName", "tournament", "tournament_name") ?? field(m, "round") ?? "Torneo Desconocido",
            // CLAVE: Si el status NO es "Finalizado", el partido se considera próximo/en curso.
            finalized: field(m, "status") === "Finalizado",
            timeAgo: timeAgoFrom(field(m, "match_datetime", "starts_at", "scheduled_at") ?? field(m, "createdAt")),
            sets: (field(m, "sets") as { p1: number, p2: number }[]) ?? [],
          } as ApiMatch
        })

        const filtered = normalized.filter(
          (m) =>
            !m.finalized &&
            (m.player1Ci === playerId || m.player2Ci === playerId)
        )

        setMatches(filtered)
      } catch (err: any) {
        console.error(err)
        setError(err?.message ?? "Error desconocido al obtener partidos")
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [playerId])


  // 2. Fetch Careers (Sin cambios - Mantiene el patrón de recientes)
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoadingCareers(true);
        const apiUrl = cleanApiUrl(process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL);

        const response = await fetch(`${apiUrl}/career`); // Asumo que el endpoint es /career
        if (response.ok) {
          const json = await response.json();
          const data = json.data ?? json.careers ?? [];
          const newCareerMap = new Map<number, string>();
          data.forEach((career: any) => {
            newCareerMap.set(Number(career.career_id ?? career.id), career.name_career ?? career.name ?? career.label);
          });
          setCareerMap(newCareerMap);
        } else {
          console.error("Failed to fetch career data");
        }
      } catch (err) {
        console.error("Error fetching career data:", err);
      } finally {
        setLoadingCareers(false);
      }
    };
    fetchCareers();
  }, []);


  // 3. Fetch Player Details (Mantiene el patrón robusto de `ref` y evita refetches)
  useEffect(() => {
    const fetchDetails = async () => {
      if (matches.length === 0) {
        setLoadingPlayerDetails(false);
        return;
      }

      setLoadingPlayerDetails(true);
      const uniqueCis = new Set<string>();
      matches.forEach(m => {
        uniqueCis.add(m.player1Ci);
        uniqueCis.add(m.player2Ci);
      });

      // Marcar CIs ya conocidas como fetched para evitar llamadas API
      playerDetailsMap.forEach((_, key) => {
        fetchedCisRef.current.add(key);
      });

      const newPlayerDetailsMap = new Map<string, PlayerDetails>();
      const apiUrl = cleanApiUrl(process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL);

      for (const playerCi of Array.from(uniqueCis)) {
        if (!playerCi || fetchedCisRef.current.has(playerCi)) {
          continue;
        }
        try {
          const res = await fetch(`${apiUrl}/player/${playerCi}`);
          if (res.ok) {
            const json = await res.json();
            const pd = json.data ?? json.player ?? null;
            if (pd) {
              newPlayerDetailsMap.set(playerCi, pd as PlayerDetails);
              fetchedCisRef.current.add(playerCi);
            }
          } else {
            console.error(`Failed to fetch player details for CI: ${playerCi}`);
          }
        } catch (err) {
          console.error("Error fetching player", playerCi, err);
        }
      }

      if (newPlayerDetailsMap.size > 0) {
        setPlayerDetailsMap((prev) => new Map([...prev, ...newPlayerDetailsMap]));
      }
      setLoadingPlayerDetails(false);
    }

    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches])


  // --- Renderizado ---

  if (loading || loadingPlayerDetails || loadingCareers) {
    return (
      <section className="bg-[#2A2A3E] p-5 mt-5 mb-5 rounded-2xl border border-slate-700/50 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Próximos Partidos</h4>
        </div>
        <div className="space-y-2">
          {/* Usamos el patrón de esqueleto más detallado de tu versión original */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between gap-4"
            >
              <div className='flex items-center gap-3'>
                <Skeleton className='h-12 w-12 rounded-full' />
                <div className='space-y-1'>
                    <Skeleton className='h-4 w-[100px]' />
                    <Skeleton className='h-3 w-[80px]' />
                </div>
              </div>
              <div className='text-center space-y-2'>
                <Skeleton className='h-4 w-[40px] mx-auto' />
                <Skeleton className='h-3 w-[50px] mx-auto' />
              </div>
              <div className='flex items-center gap-3'>
                <div className='space-y-1 text-right'>
                    <Skeleton className='h-4 w-[100px]' />
                    <Skeleton className='h-3 w-[80px]' />
                </div>
                <Skeleton className='h-12 w-12 rounded-full' />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="bg-[#2A2A3E] p-5 mt-5 mb-5 rounded-2xl border border-slate-700/50 space-y-4">
        <h4 className="text-sm font-semibold text-white">Próximos Partidos</h4>
        <p className="text-sm text-red-500">Error: {error}</p>
      </section>
    )
  }

  return (
    <section className="bg-[#2A2A3E] p-5 mt-5 mb-5 rounded-2xl border border-slate-700/50 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Próximos Partidos</h4>
        <span className="text-xs text-slate-400">{matches.length} partidos</span>
      </div>

      {matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((match) => {
            const p1Ci = match.player1Ci
            const p2Ci = match.player2Ci
            const player1Details = p1Ci ? playerDetailsMap.get(p1Ci) : undefined
            const player2Details = p2Ci ? playerDetailsMap.get(p2Ci) : undefined

            const getCareerName = (details: PlayerDetails | undefined) => {
                if (loadingCareers) return "Cargando..."
                if (!details) return "—"
                // El campo career_id en PlayerDetails puede llamarse careerId o career_id
                const careerId = Number(details.career_id ?? details.career_id)
                return careerMap.get(careerId) ?? "—"
            }

            const player1CareerName = getCareerName(player1Details)
            const player2CareerName = getCareerName(player2Details)
            
            const isPlayer1Loading = loadingPlayerDetails && !player1Details
            const isPlayer2Loading = loadingPlayerDetails && !player2Details

            return (
              <div
                key={match.id}
                className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between"
              >
                {/* Info Jugador 1 */}
                <div className="flex items-center gap-3 w-full sm:w-1/3">
                  <Image
                    src={match.player1Avatar || "/placeholder-user.jpg"}
                    alt={match.player1Name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                    unoptimized
                  />
                  <div>
                    <p className="font-bold text-white text-sm">{match.player1Name}</p>
                    {isPlayer1Loading ? (
                        <div className="space-y-1 mt-1">
                            <Skeleton className='h-3 w-[60px]' />
                            <Skeleton className='h-3 w-[80px]' />
                        </div>
                    ) : (
                        player1Details && (
                        <>
                            <p className="text-xs text-slate-400">Aura: {player1Details.aura ?? "—"}</p>
                            <p className="text-xs text-slate-400">Carrera: {player1CareerName}</p>
                        </>
                        )
                    )}
                  </div>
                </div>

                {/* Info Central (VS, Torneo, Hora) */}
                <div className="flex flex-col items-center justify-center w-full sm:w-1/3 my-4 sm:my-0">
                  <p className="text-xl font-bold">
                    <span className="text-slate-400">
                      {match.score1}
                    </span>
                    <span className="text-slate-500 mx-2 text-base">VS</span>
                    <span className="text-slate-400">
                      {match.score2}
                    </span>
                  </p>
                  <p className="text-sm text-slate-400 mt-1">{match.tournamentName}</p>
                  <p className="text-xs text-slate-500">{match.timeAgo}</p>
                </div>

                {/* Info Jugador 2 */}
                <div className="flex items-center gap-3 w-full sm:w-1/3 justify-end">
                  <div className="text-right">
                    <p className="font-bold text-white text-sm">{match.player2Name}</p>
                    {isPlayer2Loading ? (
                        <div className="space-y-1 mt-1">
                            <Skeleton className='h-3 w-[60px] ml-auto' />
                            <Skeleton className='h-3 w-[80px] ml-auto' />
                        </div>
                    ) : (
                        player2Details && (
                        <>
                            <p className="text-xs text-slate-400">Aura: {player2Details.aura ?? "—"}</p>
                            <p className="text-xs text-slate-400">Carrera: {player2CareerName}</p>
                        </>
                        )
                    )}
                  </div>
                  <Image
                    src={match.player2Avatar || "/placeholder-user.jpg"}
                    alt={match.player2Name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                    unoptimized
                  />
                </div>
                
                {/* Sets (solo si hay sets disponibles y es relevante para partidos futuros/en curso) */}
                {match.sets && match.sets.length > 0 && (
                    <div className="w-full pt-4 border-t border-slate-700/50 flex justify-center gap-2 mt-4">
                        {match.sets.map((set, index) => (
                            <div
                                key={index}
                                className={`px-3 py-1 rounded text-sm font-semibold 
                                ${set.p1 > set.p2 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}
                                `}
                            >
                                {set.p1}-{set.p2}
                            </div>
                        ))}
                    </div>
                )}

              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No se encontraron partidos próximos para este usuario.</p>
      )}
    </section>
  )
}

export default UpcomingMatches