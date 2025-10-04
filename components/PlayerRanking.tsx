"use client"

import type React from "react"
import PlayerList from "./PlayerList" // Asegúrate de que la ruta sea correcta

const PlayerRanking: React.FC = () => {
    return (
        <section className="mb-12 shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">Ranking de Jugadores (Top 10)</h2>
            </div>
            
            <PlayerList 
                limit={10}
                showFilters={false}
                showPagination={false}
                showTitle={false}
            />
        </section>
    )
}

export default PlayerRanking