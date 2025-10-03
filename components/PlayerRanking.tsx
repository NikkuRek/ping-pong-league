"use client"

import type React from "react"
import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PlayerForList } from "@/types";
import { usePlayers } from "@/hooks/usePlayers"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// El componente PlayerItem se mantiene igual ya que no usa lógica de paginación.
const PlayerItem: React.FC<{ player: PlayerForList; rank: number }> = ({ player, rank }) => {
    const router = useRouter();

    // Get only the first word before any whitespace for first and last names
    const firstName = player.first_name?.trim().split(/\s+/)[0] ?? "";
    const lastName = player.last_name?.trim().split(/\s+/)[0] ?? "";

    const rankGradients: { [key: number]: string } = {
        0: "bg-gradient-to-r from-[#FFD700] to-[#FFECB3]", // Gold
        1: "bg-gradient-to-r from-[#C0C0C0] to-[#E0E0E0]", // Silver
        2: "bg-gradient-to-r from-[#CD7F32] to-[#FFAB73]", // Bronze
    };

    const rankNameColors: { [key: number]: string } = {
        0: "text-amber-900",
        1: "text-slate-900",
        2: "text-orange-950",
    };
    const rankDetailsColors: { [key: number]: string } = {
        0: "text-amber-800",
        1: "text-slate-700",
        2: "text-orange-900",
    };
    const rankBorders: { [key: number]: string } = {
        0: "border-amber-200",
        1: "border-slate-200",
        2: "border-orange-200",
    };

    const backgroundClass = rankGradients[rank] || "bg-gradient-to-r from-[#4D2067] to-[#560485]";
    const nameColorClass = rankNameColors[rank] || "text-white";
    const detailsColorClass = rankDetailsColors[rank] || "text-slate-400";
    const borderClass = rankBorders[rank] || "border-violet-900";

    const openProfile = () => {
        // Ajusta la ruta según tu estructura (por ejemplo /player o /players)
        router.push(`/players/${player.ci}`);
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openProfile();
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={openProfile}
            onKeyDown={onKeyDown}
            className={`flex p-3 rounded-lg border ${borderClass} ${backgroundClass} cursor-pointer hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-purple-500`}
        >
            <div className="flex justify-between w-full">
                {/* Left side */}
                <Image
                    src={player.avatar || "/placeholder.svg"}
                    alt={`${firstName} ${lastName}`.trim()}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                />

                <div>
                    <p className={`font-semibold ${nameColorClass}`}>{`${firstName} ${lastName}`.trim()}</p>
                    <p className={`text-xs ${detailsColorClass}`}>{player.career_name}</p>
                </div>

                {/* Right side */}
                <div className="text-right">
                    {/* El rango se calcula con el índice + 1 de la lista de todos los jugadores sin filtrar */}
                    <p className={`font-semibold ${nameColorClass}`}>Rank: {rank + 1}</p>
                    <p className={`text-xs ${detailsColorClass}`}>Aura: {player.aura}</p>
                </div>
            </div>
        </div>
    )
}

const PlayerRanking: React.FC = () => {
    const { players, loading, error } = usePlayers()
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
    const [selectedCareer, setSelectedCareer] = useState<string | null>(null);

    const playerRankMap = useMemo(() => {
        const map = new Map<string, number>();
        players.forEach((player, index) => {
            map.set(player.ci, index + 1);
        });
        return map;
    }, [players]);

    const uniqueSemesters = useMemo(() => {
        const semesters = new Set<number>();
        players.forEach(player => semesters.add(player.semester));
        return Array.from(semesters).sort((a, b) => a - b);
    }, [players]);

    const uniqueCareers = useMemo(() => {
        const careers = new Set<string>();
        players.forEach(player => careers.add(player.career_name));
        return Array.from(careers).sort();
    }, [players]);

    const filteredPlayers = useMemo(() => {
        let currentPlayers = players;

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentPlayers = currentPlayers.filter(
                (p) =>
                    p.first_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    p.last_name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    p.ci.toLowerCase().includes(lowerCaseSearchTerm)
            );
        }

        if (selectedSemester) {
            currentPlayers = currentPlayers.filter(
                (p) => p.semester === parseInt(selectedSemester)
            );
        }

        if (selectedCareer) {
            currentPlayers = currentPlayers.filter(
                (p) => p.career_name === selectedCareer
            );
        }

        return currentPlayers;
    }, [players, searchTerm, selectedSemester, selectedCareer]);

    if (loading) {
        return <div>Cargando jugadores...</div>
    }

    if (error) {
        console.error("Error loading players:", error);
        return <div>Error cargando jugadores.</div>;
    }

    const playersToShow = filteredPlayers.slice(0, 10);


    return (
        <section className="mb-12 shadow-lg" >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Ranking de Jugadores (Top 10)</h2>
            </div>

            <div className="space-y-3">
                {playersToShow.length > 0 ? (
                    playersToShow.map((p) => (
                        // El rank se obtiene del mapa de rangos original para mantener el orden global
                        <PlayerItem key={p.ci} player={p} rank={playerRankMap.get(p.ci)! - 1} />
                    ))
                ) : (
                    <div className="text-center text-slate-400 py-8">No se encontraron jugadores.</div>
                )}
            </div>
            {/* Se eliminan los botones de paginación */}
        </section>
    )
}

export default PlayerRanking
