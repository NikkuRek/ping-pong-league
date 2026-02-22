import React, { Suspense } from "react"
import PlayerDetailClient from "@/components/PlayerDetailClient"

export default function Page() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center text-muted-foreground">Cargando jugador...</div>}>
      <PlayerDetailClient />
    </Suspense>
  )
}
