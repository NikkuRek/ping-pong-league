"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSocket } from "@/hooks/useSocket"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { getApiUrl } from "@/lib/api-config"
import type { Match, Inscription } from "@/types"
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"

interface PendingConsensusMatch {
  match: Match
  player1Name: string
  player2Name: string
  score1: number
  score2: number
}

interface MatchConsensusPanelProps {
  playerCI: string
}

const MatchConsensusPanel: React.FC<MatchConsensusPanelProps> = ({ playerCI }) => {
  const { toast } = useToast()
  const { token } = useAuth()
  const [pendingMatches, setPendingMatches] = useState<PendingConsensusMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleMatchFinalized = useCallback(({ matchId }: { matchId: number }) => {
    setPendingMatches(prev => prev.filter(m => m.match.match_id !== matchId))
    toast({ 
      title: "Partido Finalizado", 
      description: `El partido #${matchId} ha sido confirmado exitosamente.`,
      variant: "success"
    })
  }, [toast])

  const handleMatchRejected = useCallback(({ matchId, reason }: { matchId: number; reason: string }) => {
    setPendingMatches(prev => prev.filter(m => m.match.match_id !== matchId))
    toast({
      title: "❌ Resultado Rechazado",
      description: `El resultado del partido #${matchId} fue rechazado. Motivo: ${reason}`,
      variant: "destructive",
    })
  }, [toast])

  const handleError = useCallback(({ message }: { message: string }) => {
    toast({ title: "Error", description: message, variant: "destructive" })
    setSubmitting(false)
  }, [toast])

  const { approveResult, rejectResult } = useSocket({
    playerCI,
    token,
    onMatchFinalized: handleMatchFinalized,
    onMatchRejected: handleMatchRejected,
    onError: handleError,
  })

  const fetchPendingConsensusMatches = useCallback(async () => {
    try {
      setLoading(true)
      const apiUrl = getApiUrl()

      // Get all matches
      const matchesRes = await fetch(`${apiUrl}/match`)
      if (!matchesRes.ok) return
      const matchesData = await matchesRes.json()
      const allMatches: Match[] = matchesData.data || []

      // Filter to only 'Propuesto' matches
      const proposedMatches = allMatches.filter(m => m.status === "Propuesto")
      if (proposedMatches.length === 0) {
        setPendingMatches([])
        return
      }

      // Get inscriptions to resolve player CIs
      const inscriptionsRes = await fetch(`${apiUrl}/inscription`)
      if (!inscriptionsRes.ok) return
      const inscriptionsData = await inscriptionsRes.json()
      const inscriptions: Inscription[] = inscriptionsData.data || []

      // Build consensus matches where current player is the OPPONENT (not the proposer)
      const results: PendingConsensusMatch[] = []

      for (const match of proposedMatches) {
        const ins1 = inscriptions.find(i => i.inscription_id === match.inscription1_id)
        const ins2 = inscriptions.find(i => i.inscription_id === match.inscription2_id)
        if (!ins1 || !ins2) continue

        // Only show if current player is one of the two (rival needs to approve)
        const isPlayer1 = ins1.player_ci === playerCI
        const isPlayer2 = ins2.player_ci === playerCI
        if (!isPlayer1 && !isPlayer2) continue

        // Compute score from sets
        let score1 = 0, score2 = 0
        match.sets?.forEach(s => {
          if (s.score_participant1 > s.score_participant2) score1++
          else if (s.score_participant2 > s.score_participant1) score2++
        })

        const p1Name = `${ins1.player?.first_name ?? ""} ${ins1.player?.last_name ?? ""}`.trim()
        const p2Name = `${ins2.player?.first_name ?? ""} ${ins2.player?.last_name ?? ""}`.trim()

        results.push({ match, player1Name: p1Name, player2Name: p2Name, score1, score2 })
      }

      setPendingMatches(results)
    } catch (err) {
      console.error("Error cargando partidos en consenso:", err)
    } finally {
      setLoading(false)
    }
  }, [playerCI])

  useEffect(() => {
    fetchPendingConsensusMatches()
  }, [fetchPendingConsensusMatches])

  const handleApprove = async (matchId: number) => {
    setSubmitting(true)
    approveResult(matchId)
    // Optimistic: remove after short delay waiting for server confirmation
    setTimeout(() => setSubmitting(false), 3000)
  }

  const openRejectModal = (matchId: number) => {
    setRejectTargetId(matchId)
    setRejectReason("")
    setRejectModalOpen(true)
  }

  const handleConfirmReject = async () => {
    if (!rejectTargetId) return
    if (!rejectReason.trim()) {
      toast({ title: "Motivo requerido", description: "Debes ingresar un motivo para rechazar el resultado.", variant: "destructive" })
      return
    }
    setSubmitting(true)
    rejectResult(rejectTargetId, rejectReason.trim())
    setRejectModalOpen(false)
    setRejectReason("")
    setRejectTargetId(null)
    setTimeout(() => setSubmitting(false), 3000)
  }

  if (loading) return null // Don't flash a panel if loading
  if (pendingMatches.length === 0) return null

  return (
    <>
      <section className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/40 p-5 rounded-2xl space-y-4 mb-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h4 className="text-sm font-semibold text-amber-300">Resultados Pendientes de Aprobación</h4>
          <span className="ml-auto text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
            {pendingMatches.length}
          </span>
        </div>

        <div className="space-y-3">
          {pendingMatches.map(({ match, player1Name, player2Name, score1, score2 }) => (
            <div key={match.match_id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
              {/* Players and score */}
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-3">
                <p className="text-sm font-bold text-white truncate">{player1Name}</p>
                <div className="text-center">
                  <p className="text-lg font-bold text-white">
                    <span className={score1 > score2 ? "text-green-400" : "text-slate-400"}>{score1}</span>
                    <span className="text-slate-500 mx-1">–</span>
                    <span className={score2 > score1 ? "text-green-400" : "text-slate-400"}>{score2}</span>
                  </p>
                  <div className="flex items-center justify-center gap-1 text-amber-400 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px]">Propuesto</span>
                  </div>
                </div>
                <p className="text-sm font-bold text-white truncate text-right">{player2Name}</p>
              </div>

              {/* Sets detail */}
              {match.sets && match.sets.filter(s => !(s.score_participant1 === 0 && s.score_participant2 === 0)).length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3 justify-center">
                  {match.sets
                    .filter(s => !(s.score_participant1 === 0 && s.score_participant2 === 0))
                    .map((s, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                        {s.score_participant1}–{s.score_participant2}
                      </span>
                    ))}
                </div>
              )}

              {/* Rejection reason if exists */}
              {match.rejection_reason && (
                <div className="text-xs text-red-400 bg-red-900/20 rounded p-2 mb-3 border border-red-500/30">
                  ⚠️ Rechazado anteriormente: {match.rejection_reason}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5 text-xs"
                  onClick={() => handleApprove(match.match_id)}
                  disabled={submitting}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 gap-1.5 text-xs"
                  onClick={() => openRejectModal(match.match_id)}
                  disabled={submitting}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Rechazar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="bg-[#1C1C2E] border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">Rechazar Resultado</DialogTitle>
            <DialogDescription className="text-slate-400">
              Indica el motivo del rechazo. Esto será enviado al jugador que propuso el resultado.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              placeholder="Ej: Los sets son incorrectos, el marcador fue 3-1 no 3-0..."
              value={rejectReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectReason(e.target.value)}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
            />
            <p className="text-xs text-slate-500 mt-1">{rejectReason.length} / 500</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModalOpen(false)} className="border-slate-600 text-slate-300">
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject} disabled={!rejectReason.trim() || submitting}>
              Confirmar Rechazo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MatchConsensusPanel
