"use client"

import { useState, useEffect } from "react"
import { getApiUrl } from "@/lib/api-config"

export interface AuraRecord {
  aura_record_id: number
  match_id: number
  player_ci: string
  previous_aura: number
  new_aura: number
  change_aura: string
  date: string
  createdAt: string
  updatedAt: string
}

export function useAuraRecords(playerId: string) {
  const [records, setRecords] = useState<AuraRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!playerId) {
      setLoading(false)
      return
    }

    const fetchRecords = async () => {
      try {
        setLoading(true)
        const apiUrl = getApiUrl()
        const response = await fetch(`${apiUrl}/aura_record/player/${playerId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch aura records")
        }

        const data = await response.json()
        setRecords(data.data || [])
      } catch (err: any) {
        console.error("[useAuraRecords] Error:", err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [playerId])

  return { records, loading, error }
}
