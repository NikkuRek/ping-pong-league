"use client"

import { useState, useEffect } from "react"
import type { PlayerForList, Career } from "@/types"
import { apiGet } from "@/lib/api"

const transformPlayerData = (data: any, careerMap: { [key: number]: string }): PlayerForList[] => {
  const players = Array.isArray(data) ? data : data.data

  if (!Array.isArray(players)) {
    console.error("transformPlayerData couldn't find a players array in data:", data)
    return []
  }

  return players
    .sort((a, b) => (b.aura ?? 0) - (a.aura ?? 0))
    .map((player) => ({
      ...player,
      aura: player.aura ?? 0,
      avatar: `https://picsum.photos/seed/player${player.ci}/40/40`,
      career_name: careerMap[player.career_id] ?? "N/A",
      Days: player.Days,
    }))
}

export const usePlayers = () => {
  const [players, setPlayers] = useState<PlayerForList[]>([])
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersData, careersData] = await Promise.all([
          apiGet<any>("/player/active"),
          apiGet<Career[]>("/career"),
        ])

        const careers = Array.isArray(careersData) ? careersData : careersData
        setCareers(careers)

        const careerMap = careers.reduce((map: { [key: number]: string }, career) => {
          map[career.career_id] = career.name_career
          return map
        }, {})

        const formattedData = transformPlayerData(playersData, careerMap)
        setPlayers(formattedData)
      } catch (e) {
        console.error("[v0] Error fetching from API:", e)
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { players, careers, loading, error }
}
