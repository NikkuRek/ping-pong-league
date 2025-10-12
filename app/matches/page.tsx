"use client"

import type React from "react"
import MatchHistory from "@/components/MatchHistory"

export default function MatchesPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Historial de Partidos</h1>
        <p className="text-slate-400 mt-2">Explora todos los partidos registrados en el sistema</p>
      </div>
      <MatchHistory />
    </div>
  )
}
