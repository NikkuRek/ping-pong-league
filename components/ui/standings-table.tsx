"use client"

import Image from "next/image"
import Link from "next/link"
import { Tooltip } from "@/components/ui/tooltip"
import type { TournamentStanding as Standing } from "@/types"

interface StandingsTableProps {
    standings: Standing[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
    return (
        <div className="bg-[#2A2A3E] p-2 rounded-2xl border border-slate-700/50">
            <h2 className="text-2xl font-bold p-4">Tabla de Posiciones</h2>
            <div className="space-y-3">
                {standings.map((standing, index) => {
                    // Calculate qualification spots based on total participants
                    const totalParticipants = standings.length
                    let qualifiedSpots = 0
                    let almostQualifiedSpots = 0

                    if (totalParticipants >= 20) {
                        qualifiedSpots = 16
                        almostQualifiedSpots = 0
                    } else if (totalParticipants >= 16) {
                        qualifiedSpots = 4
                        almostQualifiedSpots = 6
                    } else if (totalParticipants >= 14) {
                        qualifiedSpots = 6
                        almostQualifiedSpots = 4
                    } else if (totalParticipants >= 12) {
                        qualifiedSpots = 8
                        almostQualifiedSpots = 0
                    }

                    // Determine styling based on index (order in list), not position
                    const isQualified = index < qualifiedSpots
                    const isAlmostQualified = index >= qualifiedSpots && index < (qualifiedSpots + almostQualifiedSpots)

                    let backgroundClass = "bg-gradient-to-r from-[#37374D] to-[#454557]"
                    let borderClass = "border-slate-500"

                    if (isQualified) {
                        backgroundClass = "bg-gradient-to-r from-[#6E2DBD] to-[#6B18D9]"
                        borderClass = "border-indigo-600"
                    } else if (isAlmostQualified) {
                        backgroundClass = "bg-gradient-to-r from-[#7C57AD] to-[#6655A6]"
                        borderClass = "border-indigo-600"
                    }

                    const nameColorClass = "text-slate-50"
                    const detailsColorClass = "text-slate-50"

                    // Extract first name and first last name
                    const getShortName = (fullName: string): string => {
                        if (!fullName) return "—"
                        const names = fullName.trim().split(/\s+/).filter(n => n.length > 0)
                        if (names.length === 0) return "—"
                        if (names.length === 1) return names[0]
                        const firstName = names[0]
                        const midPoint = Math.ceil(names.length / 2)
                        const firstLastName = names[midPoint] || names[1]
                        return `${firstName} ${firstLastName}`
                    }

                    const shortName = getShortName(standing.player_name)

                    return (
                        <Link
                            key={standing.player_ci}
                            href={`/players/${standing.player_ci}`}
                            className={`flex items-center p-4 rounded-lg border ${borderClass} ${backgroundClass} hover:opacity-95 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                            <div className="flex items-center justify-between w-full gap-4">
                                {/* Left side - Rank and player info */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className={`text-2xl font-bold ${nameColorClass} w-8 text-center flex-shrink-0`}>
                                        {standing.displayPosition}
                                    </div>
                                    <Image
                                        src={`https://picsum.photos/seed/${standing.player_ci}/40/40`}
                                        alt={standing.player_name}
                                        width={40}
                                        height={40}
                                        className="rounded-full object-cover flex-shrink-0"
                                        unoptimized
                                    />
                                    <div className="text-left min-w-0 flex-1">
                                        <p className={`font-semibold ${nameColorClass} truncate`}>{shortName}</p>
                                        <p className={`text-xs ${detailsColorClass}`}>
                                            {standing.matches_won}G - {standing.matches_lost}P
                                            {standing.bonus_points > 0 && (
                                                <span className="text-emerald-300">
                                                    {" "}(+{standing.bonus_points} bonus)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Right side - Stats */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Tooltip
                                        content={
                                            (() => {
                                                const regularWins = standing.matches_won - (standing.default_wins || 0);
                                                const defaultWins = standing.default_wins || 0;
                                                return (
                                                    <div className="text-left space-y-1">
                                                        <p className="font-semibold text-white mb-2">Desglose de puntos:</p>
                                                        {regularWins > 0 && (
                                                            <p className="text-slate-300">• {regularWins} victoria(s): {regularWins * 3} pts</p>
                                                        )}
                                                        {defaultWins > 0 && (
                                                            <p className="text-yellow-400">• {defaultWins} victoria(s) por default: {defaultWins * 2} pts</p>
                                                        )}
                                                        {standing.losses_1_2 > 0 && (
                                                            <p className="text-emerald-400">• {standing.losses_1_2} derrota(s) 1-2: {standing.losses_1_2} pt(s)</p>
                                                        )}
                                                        {standing.losses_0_2 > 0 && (
                                                            <p className="text-slate-400">• {standing.losses_0_2} derrota(s) 0-2: 0 pts</p>
                                                        )}
                                                        <div className="border-t border-slate-600 mt-2 pt-2">
                                                            <p className="text-white font-bold">Total: {standing.points} pts</p>
                                                        </div>
                                                    </div>
                                                );
                                            })()
                                        }
                                    >
                                        <div className="text-center cursor-help">
                                            <p className={`text-xs ${detailsColorClass}`}>Pts</p>
                                            <p className={`font-bold text-lg ${nameColorClass}`}>{standing.points}</p>
                                        </div>
                                    </Tooltip>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
