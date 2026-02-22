import { MatchData, PlayerProfile } from "@/types"
import { AuraRecord } from "@/hooks/useAuraRecords"

export interface ExtendedStats {
  winLossRatio: string
  winLossByTournament: Record<string, { won: number; lost: number; played: number; ratio: string }>
  currentStreak: { type: "win" | "loss" | null; count: number }
  eloEvolution: { date: string; aura: number }[]
  totalWon: number
  totalLost: number
  totalPointsWon: number
  totalPointsLost: number
  deuceSetsWonCount: number
  deuceSetsPlayed: number
  totalSetsWon: number
  totalSetsPlayed: number
  comebacks: number
  last5Results: ("win" | "loss")[]
  weeklyEloVariation: number
  setsWonAverage: string
  cleanSweeps: number
  daysSinceLastMatch: number | null
  monthlyMatchCount: number
  nemesis: { name: string; ci: string; ratio: string } | null
  customer: { name: string; ci: string; wins: number } | null
  performancebyElo: {
    giantKiller: string
    bully: string
  }
  attendance: {
    monthly: number
    yearly: number
  }
  longestMatch: {
    points: number
    sets: number
    opponent: string
  } | null
}

export const calculateExtendedStats = (
  matches: MatchData[],
  auraRecords: AuraRecord[],
  playerProfile: PlayerProfile | null
): ExtendedStats => {
  const finishedMatches = matches.filter((m) => m.result === "win" || m.result === "loss")
  const totalPlayed = finishedMatches.length
  const totalWon = finishedMatches.filter((m) => m.result === "win").length
  const totalLost = finishedMatches.filter((m) => m.result === "loss").length
  // 1. Snapshot
  const winLossRatio = totalPlayed > 0 ? ((totalWon / totalPlayed) * 100).toFixed(1) : "0.0"

  const winLossByTournament: ExtendedStats["winLossByTournament"] = {}
  finishedMatches.forEach((m) => {
    if (!winLossByTournament[m.tournamentName]) {
      winLossByTournament[m.tournamentName] = { won: 0, lost: 0, played: 0, ratio: "0.0" }
    }
    winLossByTournament[m.tournamentName].played++
    if (m.result === "win") winLossByTournament[m.tournamentName].won++
    else if (m.result === "loss") winLossByTournament[m.tournamentName].lost++
    
    winLossByTournament[m.tournamentName].ratio = 
      ((winLossByTournament[m.tournamentName].won / winLossByTournament[m.tournamentName].played) * 100).toFixed(1)
  })

  let streak = 0
  let streakType: "win" | "loss" | null = null
  if (finishedMatches.length > 0) {
    const lastResult = finishedMatches[0].result
    streakType = lastResult === "win" ? "win" : "loss"
    for (const m of finishedMatches) {
      if (m.result === lastResult) streak++
      else break
    }
  }

  const sortedRecords = [...auraRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  let eloEvolution = sortedRecords.map((r) => {
    // Try both new_aura and aura, and ensure it's a number
    const auraVal = Number((r as any).new_aura !== undefined ? (r as any).new_aura : (r as any).aura)
    
    const recordDate = new Date(r.date)
    return {
      date: recordDate.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }),
      aura: isNaN(auraVal) ? (playerProfile?.aura || 1200) : auraVal,
      fullDate: recordDate.toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
    }
  })

  // Add current aura as the latest point
  const currentAura = playerProfile ? Number(playerProfile.aura) : NaN
  if (!isNaN(currentAura)) {
    const lastAura = eloEvolution.length > 0 ? eloEvolution[eloEvolution.length - 1].aura : null
    if (lastAura !== currentAura) {
      eloEvolution.push({
        date: "Hoy",
        aura: currentAura,
        fullDate: "Actual",
      })
    }
  }

  // Limit to last 20 points for better readability and focus on recent performance
  if (eloEvolution.length > 20) {
    eloEvolution = eloEvolution.slice(-20)
  }

  // Add a sequential label for the X-axis (countdown to 0)
  const total = eloEvolution.length
  eloEvolution = eloEvolution.map((item, idx) => ({
    ...item,
    recordLabel: (total - 1 - idx).toString()
  }))
  let totalPointsWon = 0
  let totalPointsLost = 0
  finishedMatches.forEach((m) => {
    m.sets.forEach((s) => {
      totalPointsWon += s.p1
      totalPointsLost += s.p2
    })
  })

  // Time-based variables
  const now = new Date()
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

  // 1. Power Level (Estado de Forma)
  const last5Results = finishedMatches.slice(0, 5).map(m => m.result as "win" | "loss")
  
  const lastMonday = new Date()
  lastMonday.setDate(lastMonday.getDate() - ((lastMonday.getDay() + 6) % 7))
  lastMonday.setHours(0,0,0,0)
  
  const recordLastMonday = sortedRecords.findLast(r => new Date(r.date) <= lastMonday)
  const weeklyEloVariation = recordLastMonday 
    ? (playerProfile?.aura || 0) - Number((recordLastMonday as any).new_aura || (recordLastMonday as any).aura)
    : 0

  // 2. Eficiencia de Sets
  let totalSetsWon = 0
  let totalSetsPlayed = 0
  let cleanSweeps = 0
  finishedMatches.forEach(m => {
    totalSetsWon += m.score1
    totalSetsPlayed += (m.score1 + m.score2)
    if (m.result === "win" && m.score2 === 0 && m.score1 >= 2) cleanSweeps++
  })
  const setsWonAverage = totalPlayed > 0 ? (totalSetsWon / totalPlayed).toFixed(2) : "0.00"

  // 3. Actividad Reciente
  const lastMatch = finishedMatches[0]
  const daysSinceLastMatch = lastMatch 
    ? Math.floor((now.getTime() - new Date(lastMatch.matchDatetime).getTime()) / (1000 * 60 * 60 * 24))
    : null
  const monthlyMatchCount = finishedMatches.filter(m => new Date(m.matchDatetime) >= oneMonthAgo).length

  // 4. Game Dominance (Deuce)
  let deuceSetsPlayed = 0
  let deuceSetsWonCount = 0
  finishedMatches.forEach((m) => {
    m.sets.forEach((s) => {
      if (s.p1 >= 10 && s.p2 >= 10) {
        deuceSetsPlayed++
        if (s.p1 > s.p2) deuceSetsWonCount++
      }
    })
  })

  let comebacks = 0
  finishedMatches.forEach((m) => {
    if (m.result === "win" && m.sets.length > 0) {
      const setsNeededToWin = m.score1
      let playerSets = 0
      let opponentSets = 0
      let wasAtRisk = false

      for (let i = 0; i < m.sets.length - 1; i++) {
        const s = m.sets[i]
        if (s.p1 > s.p2) playerSets++
        else opponentSets++

        // If at any point the opponent was one set away from victory AND leading
        if (opponentSets === setsNeededToWin - 1 && opponentSets > playerSets) {
          wasAtRisk = true
          break
        }
      }
      
      if (wasAtRisk) comebacks++
    }
  })

  // 3. Opponent Analysis
  const h2h: Record<string, { name: string; wins: number; played: number }> = {}
  finishedMatches.forEach((m) => {
    if (!h2h[m.player2Ci]) h2h[m.player2Ci] = { name: m.player2Name, wins: 0, played: 0 }
    h2h[m.player2Ci].played++
    if (m.result === "win") h2h[m.player2Ci].wins++
  })

  let nemesis = null
  let customer = null
  
  const opponents = Object.entries(h2h)
  if (opponents.length > 0) {
    const potentialNemesis = opponents
      .map(([ci, data]) => ({ ci, ...data, ratio: (data.wins / data.played) }))
      .sort((a, b) => a.ratio - b.ratio || b.played - a.played)
    
    if (potentialNemesis.length > 0 && potentialNemesis[0].ratio < 0.5) {
      nemesis = { 
        name: potentialNemesis[0].name, 
        ci: potentialNemesis[0].ci, 
        ratio: (potentialNemesis[0].ratio * 100).toFixed(1) 
      }
    }

    const potentialCustomer = opponents
      .map(([ci, data]) => ({ ci, ...data }))
      .sort((a, b) => b.wins - a.wins || b.played - a.played)
    
    if (potentialCustomer.length > 0 && potentialCustomer[0].wins > 0) {
      customer = { 
        name: potentialCustomer[0].name, 
        ci: potentialCustomer[0].ci, 
        wins: potentialCustomer[0].wins 
      }
    }
  }

  const performancebyElo = {
    giantKiller: "—",
    bully: "—"
  }

  const monthlyAttendance = new Set(
    finishedMatches
      .filter(m => new Date(m.matchDatetime) >= oneMonthAgo && m.tournamentId !== 1 && m.tournamentId !== 2)
      .map(m => m.tournamentName)
  ).size

  const yearlyAttendance = new Set(
    finishedMatches
      .filter(m => new Date(m.matchDatetime) >= oneYearAgo && m.tournamentId !== 1 && m.tournamentId !== 2)
      .map(m => m.tournamentName)
  ).size

  let longestMatch: ExtendedStats["longestMatch"] = null
  finishedMatches.forEach(m => {
    const totalPoints = m.sets.reduce((acc, s) => acc + s.p1 + s.p2, 0)
    if (!longestMatch || totalPoints > longestMatch.points) {
      longestMatch = {
        points: totalPoints,
        sets: m.sets.length,
        opponent: m.player2Name
      }
    }
  })

  return {
    winLossRatio,
    winLossByTournament,
    currentStreak: { type: streakType, count: streak },
    eloEvolution,
    totalWon,
    totalLost,
    totalPointsWon,
    totalPointsLost,
    deuceSetsWonCount,
    deuceSetsPlayed,
    totalSetsWon,
    totalSetsPlayed,
    comebacks,
    last5Results,
    weeklyEloVariation,
    setsWonAverage,
    cleanSweeps,
    daysSinceLastMatch,
    monthlyMatchCount,
    nemesis,
    customer,
    performancebyElo,
    attendance: { monthly: monthlyAttendance, yearly: yearlyAttendance },
    longestMatch
  }
}
