"use client"

import React from 'react'
import type { PlayerBackendResponse } from '@/types'
import { Input } from '@/components/ui/input'

interface PlayerSelectionProps {
  label: string
  playerSearch: string
  onPlayerSearchChange: (value: string) => void
  player: string
  onPlayerChange: (value: string) => void
  filteredPlayerOptions: PlayerBackendResponse[]
  matchTournament: string
  isMatchPrepared: boolean
}

export function PlayerSelection({
  label,
  playerSearch,
  onPlayerSearchChange,
  player,
  onPlayerChange,
  filteredPlayerOptions,
  matchTournament,
  isMatchPrepared,
}: PlayerSelectionProps) {
  return (
    <div>
      <label className="block mb-2 font-semibold text-slate-300">{label}:</label>
      <div className="space-y-2">
        <Input
          type="text"
          value={playerSearch}
          onChange={(e) => onPlayerSearchChange(e.target.value)}
          placeholder={`Buscar ${label.toLowerCase()}`}
          disabled={!matchTournament || isMatchPrepared}
          className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white disabled:opacity-50"
        />
        <select
          value={player}
          onChange={(e) => onPlayerChange(e.target.value)}
          disabled={!matchTournament || isMatchPrepared}
          className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white disabled:opacity-50"
        >
          <option value="">{matchTournament ? 'Selecciona un jugador' : 'Primero selecciona un torneo'}</option>
          {filteredPlayerOptions.map(p => (
            <option key={p.ci} value={p.ci}>
              {p.first_name} {p.last_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
