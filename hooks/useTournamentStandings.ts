"use client"

import { useMemo } from "react"
import type { Match, Inscription, TournamentStanding } from "@/types"

export function useTournamentStandings(matches: Match[], inscriptions: Inscription[]) {
  const standings = useMemo(() => {
    const standingsMap = new Map<string, TournamentStanding>()

    // Initialize standings for all inscribed players
    inscriptions.forEach((inscription) => {
      const playerCi = inscription.player_ci
      const playerName = `${inscription.player.first_name} ${inscription.player.last_name}`

      standingsMap.set(playerCi, {
        player_ci: playerCi,
        player_name: playerName,
        matches_played: 0,
        matches_won: 0,
        matches_lost: 0,
        sets_won: 0,
        points: 0,
        points_for: 0,
        points_against: 0,
        difference: 0,
      })
    })

    // Process finished matches only
    const finishedMatches = matches.filter((match) => match.status === "Finalizado")

    finishedMatches.forEach((match) => {
      // Find player CIs from inscriptions
      const inscription1 = inscriptions.find((i) => i.inscription_id === match.inscription1_id)
      const inscription2 = inscriptions.find((i) => i.inscription_id === match.inscription2_id)

      if (!inscription1 || !inscription2) return

      const player1Ci = inscription1.player_ci
      const player2Ci = inscription2.player_ci

      const standing1 = standingsMap.get(player1Ci)
      const standing2 = standingsMap.get(player2Ci)

      if (!standing1 || !standing2) return

      // Count sets won and calculate points for/against
      let player1SetsWon = 0
      let player2SetsWon = 0
      let player1PointsFor = 0
      let player2PointsFor = 0

      match.sets.forEach((set) => {
        player1PointsFor += set.score_participant1
        player2PointsFor += set.score_participant2

        if (set.score_participant1 > set.score_participant2) {
          player1SetsWon++
        } else if (set.score_participant2 > set.score_participant1) {
          player2SetsWon++
        }
      })

      // Update matches played
      standing1.matches_played++
      standing2.matches_played++

      // Update sets won
      standing1.sets_won += player1SetsWon
      standing2.sets_won += player2SetsWon

      // Update points for/against
      standing1.points_for += player1PointsFor
      standing1.points_against += player2PointsFor
      standing2.points_for += player2PointsFor
      standing2.points_against += player1PointsFor

      // Determine winner and assign points
      if (match.winner_inscription_id === match.inscription1_id) {
        standing1.matches_won++
        standing2.matches_lost++
        standing1.points += 3 // Win = 3 points
        // Loss with at least 1 set won = 1 point
        if (player2SetsWon > 0) {
          standing2.points += 1
        }
      } else if (match.winner_inscription_id === match.inscription2_id) {
        standing2.matches_won++
        standing1.matches_lost++
        standing2.points += 3 // Win = 3 points
        // Loss with at least 1 set won = 1 point
        if (player1SetsWon > 0) {
          standing1.points += 1
        }
      }

      // Update difference
      standing1.difference = standing1.points_for - standing1.points_against
      standing2.difference = standing2.points_for - standing2.points_against
    })

    // Convert to array and sort
    const standingsArray = Array.from(standingsMap.values())

    // Sort by: 1) Points (desc), 2) Difference (desc), 3) Points For (desc)
    standingsArray.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.difference !== a.difference) return b.difference - a.difference
      return b.points_for - a.points_for
    })

    return standingsArray
  }, [matches, inscriptions])

  return standings
}
