"use client"

import type React from "react"
import Link from "next/link"
import MatchHistory from "@/components/MatchHistory"
import { Button } from "@/components/ui/button"

export default function MatchesClient() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">Historial de Partidos</h1>
          <p className="text-slate-400 mt-2">Explora todos los partidos registrados en el sistema</p>
        </div>
        <Link href="/matches/create">
          <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
            + Crear Partido
          </Button>
        </Link>
      </div>
      <MatchHistory />
    </div>
  )
}
