"use client"

import type { Match, Inscription } from "@/types"
import { MatchCard } from "@/components/ui/match-card"

interface MatchListProps {
    title: string;
    matches: Match[];
    inscriptions: Inscription[];
}

export function MatchList({ title, matches, inscriptions }: MatchListProps) {
    return (
        <div className="bg-[#2A2A3E] p-2 rounded-2xl border border-slate-700/50">
            <h2 className="text-2xl font-bold p-4">{title}</h2>
            {matches.length === 0 ? (
                <p className="text-slate-400 p-4">No hay partidos.</p>
            ) : (
                <div className="space-y-4 p-4">
                    {matches.map((match) => (
                        <MatchCard key={match.match_id} match={match} inscriptions={inscriptions} />
                    ))}
                </div>
            )}
        </div>
    )
}
