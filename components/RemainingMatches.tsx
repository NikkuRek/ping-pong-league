"use client"

import React from "react"
import { usePlayerRemainingMatches } from "@/hooks/usePlayerRemainingMatches"
import { Skeleton } from "@/components/ui/skeleton"

export default function RemainingMatches({ ci }: { ci: string }) {
  const { remainingMatches, loading } = usePlayerRemainingMatches(ci)

  if (loading) {
    return <Skeleton className="h-8 w-48" />
  }

  return (
    <div className="flex flex-col justify-center items-center text-sm text-slate-400">
      <p>Rankeds Restantes:</p>
      <div className="text-xl text-purple-500 font-bold">
        <strong>{remainingMatches}</strong>
      </div>
    </div>
  )
}
