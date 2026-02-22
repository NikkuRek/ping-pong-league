import React, { Suspense } from "react"
import TournamentDetailClient from "@/components/TournamentDetailClient"

export default function Page() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center text-muted-foreground">Cargando torneo...</div>}>
      <TournamentDetailClient />
    </Suspense>
  )
}
