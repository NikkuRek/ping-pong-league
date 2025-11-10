"use client";

import React, { useState } from "react";
import type { MatchData, Tournament } from "@/types";
import PlayerStats from "./PlayerStats";

interface PlayerStatsTabsProps {
    matches: MatchData[];
    tournaments: Tournament[];
}

const TABS = [
    { key: "global", label: "Global" },
    { key: "ranked", label: "Ranked" },
    { key: "liga", label: "Liga" },
];

export const PlayerStatsTabs: React.FC<PlayerStatsTabsProps> = ({ matches, tournaments }) => {
    const [activeTab, setActiveTab] = useState("global");

    // Filtrado según la pestaña
    let filteredMatches: MatchData[] = matches;
    if (activeTab === "ranked") {
        filteredMatches = matches.filter((m) => {
            // Buscar el torneo por nombre o id
            const t = tournaments.find((t) => t.tournament_id === 2);
            return t && (m.tournamentName === t.name || m.tournamentName === t.tournament_id.toString());
        });
    } else if (activeTab === "liga") {
        const ligaIds = new Set(
            tournaments.filter((t) => t.format?.toLowerCase() === "liga").map((t) => t.tournament_id)
        );
        filteredMatches = matches.filter((m) => {
            // Buscar el torneo por nombre o id
            const t = tournaments.find((t) => t.name === m.tournamentName || t.tournament_id.toString() === m.tournamentName);
            return t && ligaIds.has(t.tournament_id);
        });
    }

    return (
        <div className="w-full mb-6">
            <div className="bg-[#2A2A3E] p-4 rounded-2xl border border-slate-700/50 w-full">
                <div className="flex gap-3 items-center content-between mb-4">
                    <div className="flex-1 flex items-center gap-4">
                        <h3 className="text-sm font-semibold text-white">Estadísticas</h3>
                    </div>
                    <div className="flex items-end">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                className={`player-stats-tab-btn py-2 px-3 text-sm font-semibold transition-colors rounded-md focus:outline-none ${activeTab === tab.key
                                    ? "bg-[#2A2A3E] text-purple-400 ring-1 ring-purple-400"
                                    : "bg-transparent text-slate-400 hover:text-purple-300"
                                    }`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                </div>
                <PlayerStats matches={filteredMatches} />
            </div>
        </div>
    );
};

export default PlayerStatsTabs;
