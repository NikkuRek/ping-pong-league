"use client";

import React from "react";
import type { MatchData } from "@/types";

interface PlayerStatsProps {
  matches: MatchData[];
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ matches }) => {
const totalPlayed = matches.filter((m) => m.result === "win" || m.result === "loss").length;
  const totalWon = matches.filter((m) => m.result === "win").length;
  const totalLost = matches.filter((m) => m.result === "loss").length;
  const winrate = totalPlayed > 0 ? ((totalWon / totalPlayed) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-[#2A2A3E] p-4 rounded-2xl border border-slate-700/50 w-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="flex flex-col items-start">
            <p className="text-xl font-bold text-purple-400">{totalPlayed}</p>
            <p className="text-xs text-slate-400">Juegos Jugados</p>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-xl font-bold text-green-400">{totalWon}</p>
            <p className="text-xs text-slate-400">Juegos Ganados</p>
          </div>
          <div className="flex flex-col items-start">
            <p className="text-xl font-bold text-red-400">{totalLost}</p>
            <p className="text-xs text-slate-400">Juegos Perdidos</p>
          </div>
        </div>

        <div className="flex flex-col items-end min-w-[80px]">
          <p className="text-2xl font-bold text-white">{winrate}%</p>
          <p className="text-xs text-slate-400">Winrate Global</p>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
