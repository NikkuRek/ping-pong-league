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
        default_wins: 0,
        matches_lost: 0,
        sets_won: 0,
        points: 0,
        points_for: 0,
        points_against: 0,
        difference: 0,
        bonus_points: 0,
        losses_1_2: 0,
        losses_0_2: 0,
        position: 0,
        displayPosition: "",
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

      // Calculate sets won with 0-0 logic (same as MatchCard)
      let player1SetsWon = 0
      let player2SetsWon = 0
      let player1PointsFor = 0
      let player2PointsFor = 0

      if (match.sets && match.sets.length > 0) {
        match.sets.forEach((set) => {
          player1PointsFor += set.score_participant1
          player2PointsFor += set.score_participant2

          const p1Score = set.score_participant1
          const p2Score = set.score_participant2

          if (p1Score > p2Score) player1SetsWon++
          else if (p2Score > p1Score) player2SetsWon++
        })
      }

      // Check if there are exactly 3 sets and all are 0-0
      const hasThreeSetsAllZero = match.sets.length === 3 && match.sets.every(set => set.score_participant1 === 0 && set.score_participant2 === 0)
      
      // If there are exactly 3 sets all 0-0 and there's a winner, adjust scores to 2-1
      if (hasThreeSetsAllZero && match.winner_inscription_id !== null) {
        if (match.winner_inscription_id === match.inscription1_id) {
          player1SetsWon = 2
          player2SetsWon = 1
        } else if (match.winner_inscription_id === match.inscription2_id) {
          player1SetsWon = 1
          player2SetsWon = 2
        }
      }
      // For matches with 1 or 2 sets all 0-0, winner gets all sets
      else if (match.sets.length > 0 && match.sets.length < 3 && match.sets.every(set => set.score_participant1 === 0 && set.score_participant2 === 0) && match.winner_inscription_id !== null) {
        if (match.winner_inscription_id === match.inscription1_id) {
          player1SetsWon = match.sets.length
          player2SetsWon = 0
        } else if (match.winner_inscription_id === match.inscription2_id) {
          player1SetsWon = 0
          player2SetsWon = match.sets.length
        }
      }

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

      // Check for default win condition: exactly 2 sets, both 1-0 for the winner
      const isDefaultWin = (() => {
        if (match.sets.length !== 2) return false;
      
        if (match.winner_inscription_id === match.inscription1_id) {
          return match.sets.every(set => set.score_participant1 === 1 && set.score_participant2 === 0);
        } else if (match.winner_inscription_id === match.inscription2_id) {
          return match.sets.every(set => set.score_participant1 === 0 && set.score_participant2 === 1);
        }
        return false;
      })();

      // Assign points based on sets won
      // Default win (2 sets of 1-0): 2 points for winner, 0 for loser
      // Regular win (2-0 or 2-1): 3 points for winner
      // Loser (1-2): 1 point
      // Loser (0-2): 0 points
      if (match.winner_inscription_id === match.inscription1_id) {
        standing1.matches_won++
        standing2.matches_lost++

        if (isDefaultWin) {
          standing1.points += 2
          standing1.default_wins++
          standing2.losses_0_2++ // Loser gets 0 points
        } else {
          standing1.points += 3 // Regular win (2-0 or 2-1)
          // Loser in a 1-2 match gets 1 point
          if (player2SetsWon >= 1) {
            standing2.points += 1
            standing2.bonus_points += 1
            standing2.losses_1_2++
          } else {
            standing2.losses_0_2++
          }
        }
      } else if (match.winner_inscription_id === match.inscription2_id) {
        standing2.matches_won++
        standing1.matches_lost++

        if (isDefaultWin) {
          standing2.points += 2
          standing2.default_wins++
          standing1.losses_0_2++ // Loser gets 0 points
        } else {
          standing2.points += 3 // Regular win (2-0 or 2-1)
          // Loser in a 1-2 match gets 1 point
          if (player1SetsWon >= 1) {
            standing1.points += 1
            standing1.bonus_points += 1
            standing1.losses_1_2++
          } else {
            standing1.losses_0_2++
          }
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

    // Calculate positions with ties
    let currentPosition = 1
    let previousPoints = -1
    let tieStartPosition = 1

    standingsArray.forEach((standing, index) => {
      if (standing.points !== previousPoints) {
        // New points value, update position
        currentPosition = index + 1
        tieStartPosition = currentPosition
        standing.position = currentPosition
        standing.displayPosition = currentPosition.toString()
        previousPoints = standing.points
      } else {
        // Same points as previous, it's a tie
        standing.position = tieStartPosition
        standing.displayPosition = "-"
      }
    })

    return standingsArray
  }, [matches, inscriptions])

  return standings
}
