import { Match, Inscription, Tournament } from "@/types"

export interface Badge {
  id: string
  label: string
  icon: string
  type: "novato" | "champion" | "runner-up" | "milestone" | "performance" | "style" | "foundation"
}

/**
 * Computes badges for a player based on their matches and global data.
 */
export function computeBadges(
  playerCi: string,
  playerMatches: Match[],
  finals: any[] = [],
  tournaments: Tournament[] = [],
  playerProfile: any = null
): Badge[] {
  const badges: Badge[] = []
  
  // Ensure playerMatches is sorted by date for streak calculations
  const sortedMatches = [...(playerMatches || [])]
    .filter(m => m && m.status === "Finalizado")
    .sort((a, b) => new Date(a.match_datetime).getTime() - new Date(b.match_datetime).getTime())

  // 1. Champion / Runner-up Badges
  finals.forEach((f: any) => {
    const p1Ci = f.Inscription1?.player?.ci || f.inscription1?.player?.ci
    const p2Ci = f.Inscription2?.player?.ci || f.inscription2?.player?.ci
    
    const participatedInFinal = p1Ci === playerCi || p2Ci === playerCi

    if (participatedInFinal) {
      const winnerId = f.winner_inscription_id
      const isWinner = (p1Ci === playerCi && winnerId === f.inscription1_id) ||
                       (p2Ci === playerCi && winnerId === f.inscription2_id)
      
      const tournamentName = f.Tournament?.name || f.tournament?.name || `Torneo ${f.tournament_id}`
      
      if (isWinner) {
        badges.push({
          id: `champion-${f.match_id}`,
          label: `Campeón de ${tournamentName}`,
          icon: "Trophy",
          type: "champion"
        })
      } else {
        badges.push({
          id: `runner-up-${f.match_id}`,
          label: `Subcampeón de ${tournamentName}`,
          icon: "Medal",
          type: "runner-up"
        })
      }
    }
  })

  // 2. Novato Badge
  if (sortedMatches.length < 10) {
    badges.push({
      id: "novato",
      label: "Novato",
      icon: "Zap",
      type: "novato"
    })
  }

  // 3. Career Milestone Badges (Cumulative)
  if (sortedMatches.length >= 50) {
    badges.push({
      id: "veterano",
      label: "Veterano de Guerra",
      icon: "History",
      type: "milestone"
    })
  }

  if (sortedMatches.length >= 100) {
    badges.push({
      id: "centenario",
      label: "El Centenario",
      icon: "CheckCircle",
      type: "milestone"
    })
  }

  // Socio Fundador (Registered in the first month - assume before 2025-02-01 or based on platform start)
  if (playerProfile?.createdAt) {
    const regDate = new Date(playerProfile.createdAt)
    const platformStart = new Date("2025-10-01") // Approximate start
    const oneMonthLater = new Date(platformStart)
    oneMonthLater.setMonth(platformStart.getMonth() + 1)
    
    if (regDate < oneMonthLater) {
      badges.push({
        id: "fundador",
        label: "Socio Fundador",
        icon: "Fingerprint",
        type: "foundation"
      })
    }
  }

  // Coleccionista de Sets (500+ points)
  let totalPoints = 0
  sortedMatches.forEach(m => {
    const isPlayer1 = m.inscription1?.player?.ci === playerCi || m.inscription1_id === (playerProfile as any)?.inscription_id
    // Wait, use playerCi comparison for safety
    m.sets?.forEach(s => {
      // Re-check player position in this match
      // We need to know if the player is participant 1 or 2
      // In Match object, we have inscription1_id and inscription2_id
      // We can check which one matches the player's inscriptions list or just check the player_ci in the nested object
      const p1Ci = m.inscription1?.player?.ci || m.inscription1?.player_ci
      if (p1Ci === playerCi) {
        totalPoints += s.score_participant1
      } else {
        totalPoints += s.score_participant2
      }
    })
  })
  
  if (totalPoints >= 500) {
    badges.push({
      id: "coleccionista",
      label: "Coleccionista de Sets",
      icon: "Library",
      type: "milestone"
    })
  }

  // 4. Performance Badges (Streaks and Dominance)
  
  // Imbatible (5 wins in a row)
  let currentStreak = 0
  let maxStreak = 0
  sortedMatches.forEach(m => {
    const isWinner = m.winner_inscription_id && 
      ((m.inscription1?.player?.ci === playerCi && m.winner_inscription_id === m.inscription1_id) ||
       (m.inscription2?.player?.ci === playerCi && m.winner_inscription_id === m.inscription2_id))
    
    if (isWinner) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 0
    }
  })
  
  if (maxStreak >= 5) {
    badges.push({
      id: "imbatible",
      label: "Imbatible",
      icon: "TrendingUp",
      type: "performance"
    })
  }

  // Muro de Piedra (Any 3-0 win)
  const hasCleanSweep = sortedMatches.some(m => {
    const isWinner = m.winner_inscription_id && 
      ((m.inscription1?.player?.ci === playerCi && m.winner_inscription_id === m.inscription1_id) ||
       (m.inscription2?.player?.ci === playerCi && m.winner_inscription_id === m.inscription2_id))
    
    if (!isWinner) return false
    
    // Check if opponent won any set
    const isPlayer1 = (m.inscription1?.player?.ci || m.inscription1?.player_ci) === playerCi
    const opponentSets = m.sets?.filter(s => isPlayer1 ? s.score_participant2 > s.score_participant1 : s.score_participant1 > s.score_participant2)
    return opponentSets?.length === 0 && (m.sets?.length || 0) >= 2 // At least best of 3 won 2-0 or 3-0
  })

  if (hasCleanSweep) {
    badges.push({
      id: "muro",
      label: "Muro de Piedra",
      icon: "Shield",
      type: "performance"
    })
  }

  // Matagigantes (Beat someone 200+ Elo above)
  const isGiantKiller = sortedMatches.some(m => {
    const isWinner = m.winner_inscription_id && 
       ((m.inscription1?.player?.ci === playerCi && m.winner_inscription_id === m.inscription1_id) ||
        (m.inscription2?.player?.ci === playerCi && m.winner_inscription_id === m.inscription2_id))
    
    if (!isWinner) return false
    
    // Check Elo records from the match
    const records = (m as any).AuraRecords || []
    const myRecord = records.find((r: any) => r.player_ci === playerCi)
    const opponentRecord = records.find((r: any) => r.player_ci !== playerCi)
    
    if (myRecord && opponentRecord) {
        // We want the Elo BEFORE the match
        // But since we only have the record *after* the match:
        // aura_after - aura_change = aura_before
        // Actually, the model only has 'aura' (the new one).
        // Let's assume 'aura' for now if change is not available, or just check the difference.
        // If we don't have enough info, skip or use a simpler check.
        const myBefore = myRecord.aura // This is the new aura. 
        // Wait, if I'm the winner, my before was lower.
        // Let's just check if the opponent was significantly higher.
        if (opponentRecord.aura > myRecord.aura + 200) return true
    }
    return false
  })
  
  if (isGiantKiller) {
    badges.push({
        id: "matagigantes",
        label: "Matagigantes",
        icon: "Sword",
        type: "performance"
    })
  }

  // Especialista en Deuce (3 wins in a row decided by 2 points diff in last set)
  let deuceStreak = 0
  let maxDeuceStreak = 0
  sortedMatches.forEach(m => {
    const isWinner = m.winner_inscription_id && 
      ((m.inscription1?.player?.ci === playerCi && m.winner_inscription_id === m.inscription1_id) ||
       (m.inscription2?.player?.ci === playerCi && m.winner_inscription_id === m.inscription2_id))
    
    if (isWinner && m.sets?.length) {
      const lastSet = m.sets[m.sets.length - 1]
      const diff = Math.abs(lastSet.score_participant1 - lastSet.score_participant2)
      if (diff === 2 && (lastSet.score_participant1 >= 10 || lastSet.score_participant2 >= 10)) {
        deuceStreak++
        maxDeuceStreak = Math.max(maxDeuceStreak, deuceStreak)
      } else {
        deuceStreak = 0
      }
    } else {
      deuceStreak = 0
    }
  })
  
  if (maxDeuceStreak >= 3) {
    badges.push({
      id: "deuce",
      label: "Especialista en Deuce",
      icon: "Activity",
      type: "performance"
    })
  }

  // 5. Personality / Style Badges
  
  // Asiduo (Participate in 3 consecutive tournaments)
  const playerTournamentIds = new Set(sortedMatches.map(m => m.tournament_id))
  const sortedTournamentIds = [...tournaments]
    .filter(t => t.status === "Finalizado")
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .map(t => t.tournament_id)
  
  let consecutiveTours = 0
  let maxConsecutiveTours = 0
  sortedTournamentIds.forEach(id => {
    if (playerTournamentIds.has(id)) {
      consecutiveTours++
      maxConsecutiveTours = Math.max(maxConsecutiveTours, consecutiveTours)
    } else {
      consecutiveTours = 0
    }
  })
  
  if (maxConsecutiveTours >= 3) {
    badges.push({
      id: "asiduo",
      label: "Asiduo",
      icon: "Repeat",
      type: "style"
    })
  }

  // El Remontador (Won after being 1 set away from losing)
  const isComebackKing = sortedMatches.some(m => {
    const isP1 = (m.inscription1?.player?.ci || m.inscription1?.player_ci) === playerCi
    const isP2 = (m.inscription2?.player?.ci || m.inscription2?.player_ci) === playerCi
    if (!isP1 && !isP2) return false

    const isWinner = m.winner_inscription_id && 
       ((isP1 && m.winner_inscription_id === m.inscription1_id) ||
        (isP2 && m.winner_inscription_id === m.inscription2_id))
    
    if (!isWinner || (m.sets?.length || 0) < 2) return false

    // Count final sets to know how many were needed to win
    let finalPlayerSets = 0
    m.sets!.forEach(s => {
      const pWon = isP1 ? s.score_participant1 > s.score_participant2 : s.score_participant2 > s.score_participant1
      if (pWon) finalPlayerSets++
    })

    const setsNeededToWin = finalPlayerSets
    let playerSets = 0
    let opponentSets = 0
    let wasAtRisk = false

    // Check state before each set transition (except the last one)
    for (let i = 0; i < m.sets!.length - 1; i++) {
        const s = m.sets![i]
        const pWon = isP1 ? s.score_participant1 > s.score_participant2 : s.score_participant2 > s.score_participant1
        if (pWon) playerSets++
        else opponentSets++

        if (opponentSets === setsNeededToWin - 1 && opponentSets > playerSets) {
          wasAtRisk = true
          break
        }
    }
    return wasAtRisk
  })
  
  if (isComebackKing) {
    badges.push({
      id: "remontador",
      label: "El Remontador",
      icon: "Rocket",
      type: "style"
    })
  }

  // Cazador de Bronce (Round "3er Puesto")
  const wonBronze = sortedMatches.some(m => {
    const isWinner = m.winner_inscription_id && 
       ((m.inscription1?.player?.ci === playerCi && m.winner_inscription_id === m.inscription1_id) ||
        (m.inscription2?.player?.ci === playerCi && m.winner_inscription_id === m.inscription2_id))
    return isWinner && m.round.toLowerCase().includes("3er")
  })
  
  if (wonBronze) {
    badges.push({
      id: "bronce",
      label: "Cazador de Bronce",
      icon: "Award",
      type: "style"
    })
  }

  return badges
}
