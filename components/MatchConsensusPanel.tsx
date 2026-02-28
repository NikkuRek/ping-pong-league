"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useSocket } from "@/hooks/useSocket"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { getApiUrl } from "@/lib/api-config"
import type { Match, Inscription, Set } from "@/types"
import { CheckCircle, XCircle, Clock, AlertTriangle, Edit2, Info } from "lucide-react"

interface PendingConsensusMatch {
  match: Match
  player1Name: string
  player2Name: string
  score1: number
  score2: number
  isProposedByMe?: boolean // Placeholder en caso de que logremos identificarlo
}

interface MatchConsensusPanelProps {
  playerCI: string
}

const MatchConsensusPanel: React.FC<MatchConsensusPanelProps> = ({ playerCI }) => {
  const { toast } = useToast()
  const { token } = useAuth()
  const [pendingMatches, setPendingMatches] = useState<PendingConsensusMatch[]>([])
  const [rejectedMatches, setRejectedMatches] = useState<PendingConsensusMatch[]>([])
  const [loading, setLoading] = useState(true)
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editMatch, setEditMatch] = useState<PendingConsensusMatch | null>(null)
  const [editSets, setEditSets] = useState<{ set_id: number; set_number: number; score1: number | string; score2: number | string }[]>([])

  const [submitting, setSubmitting] = useState(false)

  const fetchPendingConsensusMatches = useCallback(async () => {
    try {
      setLoading(true)
      const apiUrl = getApiUrl()

      const matchesRes = await fetch(`${apiUrl}/match`)
      if (!matchesRes.ok) return
      const matchesData = await matchesRes.json()
      const allMatches: Match[] = matchesData.data || []

      // Solo consideramos los "Propuesto", ya que "Rechazado" no existe más en BBDD.
      const targetMatches = allMatches.filter(m => m.status === "Propuesto")
      if (targetMatches.length === 0) {
        setPendingMatches([])
        setRejectedMatches([])
        return
      }

      const inscriptionsRes = await fetch(`${apiUrl}/inscription`)
      if (!inscriptionsRes.ok) return
      const inscriptionsData = await inscriptionsRes.json()
      const inscriptions: Inscription[] = inscriptionsData.data || []

      const pMatches: PendingConsensusMatch[] = []
      const rMatches: PendingConsensusMatch[] = []

      // Memoria local aislada por CI del usuario
      let myProposed: number[] = []
      let myRejected: number[] = []
      let rejectedByOpponent: { matchId: number, reason: string }[] = []

      if (typeof window !== 'undefined') {
        try {
           myProposed = JSON.parse(localStorage.getItem(`${playerCI}_proposedMatches`) || '[]')
           myRejected = JSON.parse(localStorage.getItem(`${playerCI}_myRejectedMatches`) || '[]')
           rejectedByOpponent = JSON.parse(localStorage.getItem(`${playerCI}_rejectedByOpponent`) || '[]')
        } catch { /* ignore */ }
      }

      for (const match of targetMatches) {
        const ins1 = inscriptions.find(i => i.inscription_id === match.inscription1_id)
        const ins2 = inscriptions.find(i => i.inscription_id === match.inscription2_id)
        if (!ins1 || !ins2) continue

        const isPlayer1 = ins1.player_ci === playerCI
        const isPlayer2 = ins2.player_ci === playerCI
        if (!isPlayer1 && !isPlayer2) continue

        let score1 = 0, score2 = 0
        match.sets?.forEach(s => {
          if (s.score_participant1 > s.score_participant2) score1++
          else if (s.score_participant2 > s.score_participant1) score2++
        })

        const p1Name = `${ins1.player?.first_name ?? ""} ${ins1.player?.last_name ?? ""}`.trim()
        const p2Name = `${ins2.player?.first_name ?? ""} ${ins2.player?.last_name ?? ""}`.trim()
        
        const isProposedByMe = myProposed.includes(match.match_id)
        const isRejectedByMe = myRejected.includes(match.match_id)
        
        const opponentRejection = rejectedByOpponent.find(r => r.matchId === match.match_id)

        // Inject the virtual rejection reason if the opponent rejected it
        if (opponentRejection) {
            match.rejection_reason = opponentRejection.reason
        }

        const mappedMatch = { match, player1Name: p1Name, player2Name: p2Name, score1, score2, isProposedByMe }

        if (isRejectedByMe) {
            // Si yo lo rechacé, va a mi pestaña de reparaciones (RMatches) para yo darle a Editar
            mappedMatch.match.status = 'Rechazado' 
            rMatches.push(mappedMatch)
        } else if (opponentRejection) {
            // Si el rival lo rechazó, va a pendientes pero lo forzamos a status visual Rechazado
            mappedMatch.match.status = 'Rechazado'
            pMatches.push(mappedMatch)
        } else {
            // Estado natural "Propuesto"
            pMatches.push(mappedMatch)
        }
      }

      setPendingMatches(pMatches)
      setRejectedMatches(rMatches)
    } catch (err) {
      console.error("Error cargando partidos en consenso:", err)
    } finally {
      setLoading(false)
    }
  }, [playerCI])

  const handleMatchFinalized = useCallback(({ matchId }: { matchId: number }) => {
    setPendingMatches(prev => prev.filter(m => m.match.match_id !== matchId))
    setRejectedMatches(prev => prev.filter(m => m.match.match_id !== matchId))
  }, [])

  const handleMatchRejected = useCallback(({ matchId, rejectedBy, reason }: { matchId: number, rejectedBy?: string, reason: string }) => {
    if (typeof window !== 'undefined') {
       if (rejectedBy === playerCI) {
           // Yo fui quien lo rechazó (doble seguridad)
           const key = `${playerCI}_myRejectedMatches`
           const local = JSON.parse(localStorage.getItem(key) || '[]')
           if (!local.includes(matchId)) {
               local.push(matchId)
               localStorage.setItem(key, JSON.stringify(local))
           }
       } else {
           // Mi oponente lo rechazó
           const key = `${playerCI}_rejectedByOpponent`
           const local = JSON.parse(localStorage.getItem(key) || '[]')
           if (!local.find((r: any) => r.matchId === matchId)) {
               local.push({ matchId, reason })
               localStorage.setItem(key, JSON.stringify(local))
           }
       }

       // Si lo teníamos propuesto lo limpiamos de ahí
       const pKey = `${playerCI}_proposedMatches`
       const pLocal = JSON.parse(localStorage.getItem(pKey) || '[]')
       localStorage.setItem(pKey, JSON.stringify(pLocal.filter((id: number) => id !== matchId)))
    }
    fetchPendingConsensusMatches()
  }, [playerCI, fetchPendingConsensusMatches])

  const handleMatchReproposed = useCallback(({ matchId, reproposedBy }: { matchId: number; reproposedBy?: string }) => {
    // Si el partido vuelve a ser re-propuesto, significa que la disputa se resolvió. Limpiamos cualquier rastro de rechazo de nuestra local.
    if (typeof window !== 'undefined') {
        const oKey = `${playerCI}_rejectedByOpponent`
        const oLocal = JSON.parse(localStorage.getItem(oKey) || '[]')
        localStorage.setItem(oKey, JSON.stringify(oLocal.filter((r: any) => r.matchId !== matchId)))
        
        const mKey = `${playerCI}_myRejectedMatches`
        const mLocal = JSON.parse(localStorage.getItem(mKey) || '[]')
        localStorage.setItem(mKey, JSON.stringify(mLocal.filter((id: number) => id !== matchId)))
    }
    fetchPendingConsensusMatches()
  }, [playerCI, fetchPendingConsensusMatches])

  const handleError = useCallback(({ message }: { message: string }) => {
    toast({ title: "Error de Socket", description: message, variant: "destructive" })
    setSubmitting(false)
  }, [toast])

  const { approveResult, rejectResult, reproposeResult } = useSocket({
    playerCI,
    token,
    onMatchFinalized: handleMatchFinalized,
    onMatchRejected: handleMatchRejected,
    onMatchReproposed: handleMatchReproposed,
    onError: handleError,
  })

  useEffect(() => {
    fetchPendingConsensusMatches()
  }, [fetchPendingConsensusMatches])

  const handleApprove = async (matchId: number) => {
    setSubmitting(true)
    approveResult(matchId)
    setTimeout(() => {
      setSubmitting(false)
      fetchPendingConsensusMatches()
    }, 2000)
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
    
    // Lo guardamos temporalmente en el caché para saber que fuimos nosotros los que rechazamos
    if (typeof window !== 'undefined') {
       const key = `${playerCI}_myRejectedMatches`
       const myRejected = JSON.parse(localStorage.getItem(key) || '[]')
       if (!myRejected.includes(rejectTargetId)) {
          myRejected.push(rejectTargetId)
          localStorage.setItem(key, JSON.stringify(myRejected))
       }
       // Remover si estuviera en mis propuestos (por seguridad)
       const pKey = `${playerCI}_proposedMatches`
       const proposed = JSON.parse(localStorage.getItem(pKey) || '[]')
       localStorage.setItem(pKey, JSON.stringify(proposed.filter((id: number) => id !== rejectTargetId)))
    }
    
    rejectResult(rejectTargetId, rejectReason.trim())
    setRejectModalOpen(false)
    setRejectReason("")
    setRejectTargetId(null)
    setTimeout(() => {
        setSubmitting(false)
        fetchPendingConsensusMatches()
    }, 2000)
  }

  const openEditModal = (m: PendingConsensusMatch) => {
    setEditMatch(m)
    // prepare sets mapping
    const existingSets = m.match.sets || []
    const mappedSets = existingSets.map(s => ({
        set_id: s.set_id,
        set_number: s.set_number || 1,
        score1: s.score_participant1,
        score2: s.score_participant2
    }))
    // en caso de que hayan sets falsos de [0,0] filtrarlos si se considera mejor
    setEditSets(mappedSets)
    setEditModalOpen(true)
  }

  const updateEditSetScore = (index: number, player: 1 | 2, value: string) => {
      const newSets = [...editSets]
      if (player === 1) newSets[index].score1 = value
      else newSets[index].score2 = value
      setEditSets(newSets)
  }

  const handleConfirmEdit = async () => {
      if (!editMatch) return
      
      const matchId = editMatch.match.match_id
      setSubmitting(true)
      const apiUrl = getApiUrl()

      try {
          // Verify valid set numbers
          const validSets = editSets.every(s => 
            !isNaN(parseInt(s.score1 as string)) && !isNaN(parseInt(s.score2 as string))
          )
          if (!validSets) {
              toast({ title: "Error", description: "Las puntuaciones deben ser números válidos.", variant: "destructive" })
              setSubmitting(false)
              return
          }

          // 1. Update Sets (PATCH)
          for (const s of editSets) {
             const patchData = {
                 score_participant1: parseInt(s.score1 as string),
                 score_participant2: parseInt(s.score2 as string)
             }
             const res = await fetch(`${apiUrl}/set/${s.set_id}`, {
                 method: 'PATCH',
                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                 body: JSON.stringify(patchData)
             })
             if (!res.ok) throw new Error("Error al actualizar sets")
          }

          // 2. Recalcular winner
          let p1Wins = 0
          let p2Wins = 0
          for (const s of editSets) {
              const s1 = parseInt(s.score1 as string)
              const s2 = parseInt(s.score2 as string)
              if (s1 > s2) p1Wins++
              else if (s2 > s1) p2Wins++
          }
          let winnerId = null
          if (p1Wins > p2Wins) winnerId = editMatch.match.inscription1_id
          else if (p2Wins > p1Wins) winnerId = editMatch.match.inscription2_id

          // 3. Update Match a "Propuesto" nuevamente (ya era Propuesto en DB, pero lo forzamos con winner_id)
          const resMatch = await fetch(`${apiUrl}/match/${matchId}`, {
             method: 'PATCH',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
             body: JSON.stringify({ status: 'Propuesto', winner_inscription_id: winnerId })
          })

          if (!resMatch.ok) throw new Error("Error al re-enviar propuesta")

          if (typeof window !== 'undefined') {
            const propKey = `${playerCI}_proposedMatches`
            const proposedMatches = JSON.parse(localStorage.getItem(propKey) || '[]')
            if (!proposedMatches.includes(matchId)) {
              proposedMatches.push(matchId)
              localStorage.setItem(propKey, JSON.stringify(proposedMatches))
            }
            
            // Retirar de mis rechazados ya que ahora lo re-envié
            const rejKey = `${playerCI}_myRejectedMatches`
            const myRejected = JSON.parse(localStorage.getItem(rejKey) || '[]')
            localStorage.setItem(rejKey, JSON.stringify(myRejected.filter((id: number) => id !== matchId)))
            
            // Retirar de rechazados por mi oponente (por si acaso había basura)
            const oppKey = `${playerCI}_rejectedByOpponent`
            const oppRejected = JSON.parse(localStorage.getItem(oppKey) || '[]')
            localStorage.setItem(oppKey, JSON.stringify(oppRejected.filter((r: any) => r.matchId !== matchId)))
          }

          reproposeResult(matchId) // Avisamos en caliente al socket del rival

          toast({ title: "Éxito", description: "Resultado editado y re-enviado satisfactoriamente.", variant: "success" })
          setEditModalOpen(false)
          fetchPendingConsensusMatches()

      } catch (e: any) {
          toast({ title: "Error", description: e.message || "Error editando resultado", variant: "destructive" })
      } finally {
          setSubmitting(false)
      }
  }

  if (loading) return null
  if (pendingMatches.length === 0 && rejectedMatches.length === 0) return null

  return (
    <>
      <div className="space-y-8 mb-12">
      
        {/* TABLA PROPUESTOS */}
        {pendingMatches.length > 0 && (
          <section className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 border border-amber-500/40 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-semibold text-amber-300">Resultados Pendientes de Aprobación</h4>
              <span className="ml-auto text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                {pendingMatches.length}
              </span>
            </div>

            <div className="space-y-3">
              {pendingMatches.map(({ match, player1Name, player2Name, score1, score2, isProposedByMe }) => (
                <div key={match.match_id} className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50">
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

                  <div className="flex gap-2">
                    {isProposedByMe ? (
                      <div className="flex-1 text-center bg-slate-700/50 rounded py-1.5 text-xs text-slate-300 border border-slate-600/50 flex items-center justify-center gap-1.5 opacity-80">
                        <Clock className="w-3.5 h-3.5" />
                        Esperando que tu rival apruebe el resultado...
                      </div>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5 text-xs"
                          onClick={() => handleApprove(match.match_id)}
                          disabled={submitting}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Aprobar
                        </Button>
                        {/* <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1 gap-1.5 text-xs"
                          onClick={() => openRejectModal(match.match_id)}
                          disabled={submitting}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Rechazar
                        </Button> */}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TABLA RECHAZADOS (Para editar) */}
        {rejectedMatches.length > 0 && (
          <section className="bg-gradient-to-br from-red-900/30 to-rose-900/20 border border-red-500/40 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <h4 className="text-sm font-semibold text-red-300">Resultados Rechazados (Requieren Corrección)</h4>
              <span className="ml-auto text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">
                {rejectedMatches.length}
              </span>
            </div>
            
            <div className="bg-red-950/30 border border-red-800/50 p-3 rounded-lg flex gap-2 items-start mt-2 text-xs text-red-200">
                <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p>Estos resultados fueron rechazados. Puedes revisar el motivo del rechazo y presionar <b>"Editar"</b> para corregir los sets y volver a enviar la propuesta a tu rival.</p>
            </div>

            <div className="space-y-3">
              {rejectedMatches.map((m) => {
                const { match, player1Name, player2Name, score1, score2 } = m
                return (
                <div key={match.match_id} className="bg-slate-800/60 rounded-xl p-4 border border-red-700/50">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-3 opacity-90">
                    <p className="text-sm font-bold text-white truncate">{player1Name}</p>
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-300">
                        <span>{score1}</span>
                        <span className="text-slate-500 mx-1">–</span>
                        <span>{score2}</span>
                      </p>
                      <div className="flex items-center justify-center gap-1 text-red-400 mt-0.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wide">Rechazado</span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-white truncate text-right">{player2Name}</p>
                  </div>

                  {match.rejection_reason && (
                    <div className="text-xs text-red-300 bg-red-900/40 rounded p-2.5 mb-3 border border-red-500/20">
                      <b>Motivo del Rechazo:</b> {match.rejection_reason}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white"
                      onClick={() => openEditModal(m)}
                      disabled={submitting}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Editar y Re-enviar
                    </Button>
                  </div>
                </div>
              )})}
            </div>
          </section>
        )}
      </div>

      {/* 
      MODAL RECHAZO 
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
              onChange={(e) => setRejectReason(e.target.value)}
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
      */}

      {/* MODAL EDICIÓN */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-[#1C1C2E] border-slate-700 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-purple-400 flex items-center gap-2">
                <Edit2 className="w-5 h-5"/>
                Corregir Sets
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Edita las puntuaciones de los sets y vuelve a enviar la propuesta para aprobación.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-2 space-y-3">
             {/* Encabezado Nombres */}
             <div className="grid grid-cols-2 gap-4 text-center font-semibold text-sm mb-2 text-slate-300">
                <div className="truncate px-1" title={editMatch?.player1Name}>{editMatch?.player1Name}</div>
                <div className="truncate px-1" title={editMatch?.player2Name}>{editMatch?.player2Name}</div>
             </div>

             {/* Sets inputs */}
             {editSets.map((s, i) => (
                 <div key={s.set_id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 bg-slate-800 p-2 rounded-lg border border-slate-700">
                    <Input 
                       type="number"
                       min={0}
                       value={s.score1}
                       onChange={(e) => updateEditSetScore(i, 1, e.target.value)}
                       className="text-center font-bold bg-slate-900 border-slate-600"
                    />
                    <span className="text-slate-500 text-xs font-bold">SET {s.set_number}</span>
                    <Input 
                       type="number"
                       min={0}
                       value={s.score2}
                       onChange={(e) => updateEditSetScore(i, 2, e.target.value)}
                       className="text-center font-bold bg-slate-900 border-slate-600"
                    />
                 </div>
             ))}
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditModalOpen(false)} className="border-slate-600 text-slate-300 w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variant="outstanding" onClick={handleConfirmEdit} disabled={submitting} className="w-full sm:w-auto">
              Re-enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default MatchConsensusPanel
