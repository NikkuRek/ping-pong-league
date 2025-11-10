"use client"

import Image from "next/image"
import Link from "next/link"
import type { Match, Inscription } from "@/types"

interface MatchCardProps {
    match: Match;
    inscriptions: Inscription[];
}

export function MatchCard({ match, inscriptions }: MatchCardProps) {
    const inscription1 = inscriptions.find((i) => i.inscription_id === match.inscription1_id)
    const inscription2 = inscriptions.find((i) => i.inscription_id === match.inscription2_id)

    if (!inscription1 || !inscription2) return null

    const player1Name = `${inscription1.player.first_name} ${inscription1.player.last_name}`
    const player2Name = `${inscription2.player.first_name} ${inscription2.player.last_name}`

    // Calculate sets won with 0-0 logic
    let player1SetsWon = 0
    let player2SetsWon = 0

    if (match.sets && match.sets.length > 0) {
        match.sets.forEach((set) => {
            const p1Score = set.score_participant1
            const p2Score = set.score_participant2

            if (p1Score > p2Score) player1SetsWon++
            else if (p2Score > p1Score) player2SetsWon++
        })
    }

    // Check if there are exactly 3 sets and all are 0-0
    const hasThreeSetsAllZero = match.sets.length === 3 && match.sets.every(set => set.score_participant1 === 0 && set.score_participant2 === 0)

    // If there are exactly 3 sets all 0-0 and there's a winner, adjust scores to 2-1
    if (hasThreeSetsAllZero && match.winner_inscription_id !== null) {
        if (match.winner_inscription_id === match.inscription1_id) {
            player1SetsWon = 2
            player2SetsWon = 1
        } else if (match.winner_inscription_id === match.inscription2_id) {
            player1SetsWon = 1
            player2SetsWon = 2
        }
    }
    // For matches with 1 or 2 sets all 0-0, winner gets all sets
    else if (match.sets.length > 0 && match.sets.length < 3 && match.sets.every(set => set.score_participant1 === 0 && set.score_participant2 === 0) && match.winner_inscription_id !== null) {
        if (match.winner_inscription_id === match.inscription1_id) {
            player1SetsWon = match.sets.length
            player2SetsWon = 0
        } else if (match.winner_inscription_id === match.inscription2_id) {
            player1SetsWon = 0
            player2SetsWon = match.sets.length
        }
    }

    const getShortName = (fullName: string): { firstName: string; lastName: string } => {
        if (!fullName) return { firstName: "—", lastName: "" }
        const names = fullName.trim().split(/\s+/).filter(n => n.length > 0)
        if (names.length === 0) return { firstName: "—", lastName: "" }
        if (names.length === 1) return { firstName: names[0], lastName: "" }
        const firstName = names[0]
        const midPoint = Math.ceil(names.length / 2)
        const firstLastName = names[midPoint] || names[1]
        return { firstName, lastName: firstLastName }
    }

    const player1Short = getShortName(player1Name)
    const player2Short = getShortName(player2Name)

    const isFinished = match.status === "Finalizado"

    return (
        <div className="bg-[#2a2a3e] p-4 rounded-2xl border border-slate-700/50">
            {/* Grid layout for match info */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-4">
                {/* Player 1 */}
                <Link href={`/players/${inscription1.player.ci}`} className="grid grid-cols-[48px_1fr] gap-3 items-center hover:opacity-80 transition-opacity">
                    <Image
                        src={`https://picsum.photos/seed/${inscription1.player.ci}/48/48`}
                        alt={player1Name}
                        width={48}
                        height={48}
                        className="rounded-full w-12 h-12"
                        unoptimized
                    />
                    <div className="min-w-0">
                        <div className="font-bold text-white hover:text-purple-400 transition-colors leading-tight">
                            <p className="break-words">{player1Short.firstName}</p>
                            {player1Short.lastName && <p className="break-words">{player1Short.lastName}</p>}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Aura: {inscription1.player.aura || 0}</p>
                    </div>
                </Link>

                {/* Score */}
                <div className="text-center px-4">
                    <p className="text-2xl font-bold whitespace-nowrap">
                        <span className={isFinished && player1SetsWon > player2SetsWon ? "text-white" : "text-slate-400"}>{player1SetsWon}</span>
                        <span className="text-slate-500 mx-2">VS</span>
                        <span className={isFinished && player2SetsWon > player1SetsWon ? "text-white" : "text-slate-400"}>{player2SetsWon}</span>
                    </p>
                    <p className={`text-xs mt-1 ${match.status === "Finalizado" ? "text-emerald-400" : "text-yellow-400"}`}>
                        {match.status}
                    </p>
                </div>

                {/* Player 2 */}
                <Link href={`/players/${inscription2.player.ci}`} className="grid grid-cols-[1fr_48px] gap-3 items-center hover:opacity-80 transition-opacity">
                    <div className="text-right min-w-0">
                        <div className="font-bold text-white hover:text-purple-400 transition-colors leading-tight">
                            <p className="break-words">{player2Short.firstName}</p>
                            {player2Short.lastName && <p className="break-words">{player2Short.lastName}</p>}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Aura: {inscription2.player.aura || 0}</p>
                    </div>
                    <Image
                        src={`https://picsum.photos/seed/${inscription2.player.ci}/48/48`}
                        alt={player2Name}
                        width={48}
                        height={48}
                        className="rounded-full w-12 h-12"
                        unoptimized
                    />
                </Link>
            </div>

            {/* Match info */}
            <div className="text-center border-t border-slate-700/50 pt-3">
                <p className="text-sm text-slate-400">{new Date(match.match_datetime).toLocaleDateString()}</p>
                <p className="text-xs text-slate-500">{match.round}</p>
            </div>

            {/* Sets - only show if finished and not all 0-0 */}
            {isFinished && match.sets.some(s => s.score_participant1 > 0 || s.score_participant2 > 0) && (
                <div className="flex justify-center gap-2 flex-wrap mt-3">
                    {match.sets
                        .filter((set) => !(set.score_participant1 === 0 && set.score_participant2 === 0))
                        .map((set, index) => (
                            <div key={index} className={`px-3 py-1 rounded text-sm font-semibold ${set.score_participant1 > set.score_participant2 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                }`}>
                                {set.score_participant1}-{set.score_participant2}
                            </div>
                        ))}
                </div>
            )}
        </div>
    )
}
