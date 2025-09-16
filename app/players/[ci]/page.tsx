import React from "react"
import PlayerProfile from "@/components/PlayerProfile"

export default function Page({ params }: { params: { ci: string } }) {
  const { ci } = params

  return (
    <div className="container mx-auto px-4 py-6">
      <PlayerProfile params={{ ci }} />
    </div>
  )
}