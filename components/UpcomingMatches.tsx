'use client'

import React, { useState, useEffect } from "react"
import { useUpcomingMatches } from "@/hooks/useUpcomingMatches"
import { Skeleton } from "./ui/skeleton"
import { PlayerDetails, Career } from "./PlayerRecentMatches.types" // Reusing these types
import { MatchData } from "@/hooks/usePlayerMatches.types" // Reusing MatchData

const UpcomingMatches: React.FC = () => {
  const { matches: upcomingMatches, loading, error } = useUpcomingMatches()
  const [playerDetailsMap, setPlayerDetailsMap] = useState<Map<string, PlayerDetails>>(new Map());
  const [careerMap, setCareerMap] = useState<Map<number, string>>(new Map());
  const [loadingPlayerDetails, setLoadingPlayerDetails] = useState(true);
  const [loadingCareers, setLoadingCareers] = useState(true);

  // Effect to fetch career data once
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoadingCareers(true);
        const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? '';
      const cleaned = rawApiUrl.replace(/^["']+|["']+$/g, '').trim();
      const apiUrl = cleaned.match(/^https?:\/\//) ? cleaned : `http://${cleaned}`;

      const response = await fetch(`${apiUrl}/career`);
        if (response.ok) {
          const data = await response.json();
          const newCareerMap = new Map<number, string>();
          data.data.forEach((career: Career) => {
            newCareerMap.set(career.career_id, career.name_career);
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
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const fetchDetails = async () => {
      if (upcomingMatches.length === 0) {
        setLoadingPlayerDetails(false);
        return;
      }

      setLoadingPlayerDetails(true);
      const uniquePlayerCis = new Set<string>();
      upcomingMatches.forEach(match => {
        uniquePlayerCis.add(match.player1Ci);
        uniquePlayerCis.add(match.player2Ci);
      });

      const newPlayerDetailsMap = new Map<string, PlayerDetails>();
      for (const ci of Array.from(uniquePlayerCis)) {
        if (!playerDetailsMap.has(ci)) { // Only fetch if not already in map
          try {
          const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? '';
      const cleaned = rawApiUrl.replace(/^["']+|["']+$/g, '').trim();
      const apiUrl = cleaned.match(/^https?:\/\//) ? cleaned : `http://${cleaned}`;

      const response = await fetch(`${apiUrl}/player/${ci}`);
            if (response.ok) {
              const data = await response.json();
              newPlayerDetailsMap.set(ci, data.data);
            } else {
              console.error(`Failed to fetch player details for CI: ${ci}`);
            }
          } catch (err) {
            console.error(`Error fetching player details for CI: ${ci}`, err);
          }
        }
      }
      setPlayerDetailsMap(prevMap => new Map([...prevMap, ...newPlayerDetailsMap]));
      setLoadingPlayerDetails(false);
    };

    fetchDetails();
  }, [upcomingMatches]);

  if (loading || loadingPlayerDetails || loadingCareers) {
    return (
      <section className="bg-[#2A2A3E] p-5 mt-5 mb-5 rounded-2xl border border-slate-700/50 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white">Próximos Partidos</h4>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between gap-4"
            >
              <div className='space-y-2'>
                <Skeleton className='h-4 w-[100px]' />
                <Skeleton className='h-3 w-[80px]' />
              </div>
              <div className='text-center space-y-2'>
                <Skeleton className='h-4 w-[40px] mx-auto' />
                <Skeleton className='h-3 w-[50px] mx-auto' />
              </div>
              <div>
                <Skeleton className='h-6 w-16 rounded-full' />
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
        <p className="text-sm text-red-500">Error al cargar los partidos.</p>
      </section>
    )
  }

  return (
    <section className="bg-[#2A2A3E] p-5 mt-5 mb-5 rounded-2xl border border-slate-700/50 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Próximos Partidos</h4>
        <span className="text-xs text-slate-400">{upcomingMatches.length} partidos</span>
      </div>

      {upcomingMatches.length > 0 ? (
        <div className="space-y-4">
          {upcomingMatches.map((match) => {
            const player1Details = playerDetailsMap.get(match.player1Ci);
            const player2Details = playerDetailsMap.get(match.player2Ci);

            const player1CareerName = player1Details ? careerMap.get(player1Details.career_id) : "Cargando...";
            const player2CareerName = player2Details ? careerMap.get(player2Details.career_id) : "Cargando...";

            return (
              <div
                key={match.id}
                className="bg-[#2A2A3E] p-4 rounded-2xl border border-slate-700/50 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-left">
                    <img
                      src={match.player1Avatar || "/placeholder-user.jpg"}
                      alt={match.player1Name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-bold text-white">{match.player1Name}</p>
                      {player1Details && (
                        <>
                          <p className="text-xs text-slate-400">Aura: {player1Details.aura}</p>
                          <p className="text-xs text-slate-400">Carrera: {player1CareerName}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      <span className="text-slate-400">
                        {match.score1}
                      </span>
                      <span className="text-slate-500 mx-2">VS</span>
                      <span className="text-slate-400">
                        {match.score2}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="font-bold text-white">{match.player2Name}</p>
                      {player2Details && (
                        <>
                          <p className="text-xs text-slate-400">Aura: {player2Details.aura}</p>
                          <p className="text-xs text-slate-400">Carrera: {player2CareerName}</p>
                        </>
                      )}
                    </div>
                    <img
                      src={match.player2Avatar || "/placeholder-user.jpg"}
                      alt={match.player2Name}
                      className="w-12 h-12 rounded-full"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-400">{match.tournamentName}</p>
                  <p className="text-xs text-slate-500">{match.timeAgo}</p>
                </div>
                {/* Sets are not relevant for upcoming matches, so they are omitted */}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No se encontraron partidos próximos.</p>
      )}
    </section>
  )
}

export default UpcomingMatches
