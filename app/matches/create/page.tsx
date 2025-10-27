"use client"

import React, { useState, useEffect } from 'react'
import type { PlayerBackendResponse, Tournament, Inscription, Match, Set, Day } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiUrl } from '@/lib/api-config'

// Type alias para el Player con Days incluidos
type PlayerWithDays = PlayerBackendResponse

// Interface para los sets que se están creando (sin IDs todavía)
interface SetCreate {
  set_number: number
  score_participant1: number
  score_participant2: number
}

export default function MatchCreationPage() {
  // Estado para datos de la API
  const [players, setPlayers] = useState<PlayerWithDays[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [pendingMatches, setPendingMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  // Estado para filtros
  const [playerSearch, setPlayerSearch] = useState('')
  const [player1Search, setPlayer1Search] = useState('')
  const [player2Search, setPlayer2Search] = useState('')
  const [matchSearch, setMatchSearch] = useState('')
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerWithDays[]>([])
  const [filteredPlayer1Options, setFilteredPlayer1Options] = useState<PlayerWithDays[]>([])
  const [filteredPlayer2Options, setFilteredPlayer2Options] = useState<PlayerWithDays[]>([])
  const [filteredPendingMatches, setFilteredPendingMatches] = useState<Match[]>([])

  // Estado para selecciones
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [selectedTournament, setSelectedTournament] = useState('')
  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [matchTournament, setMatchTournament] = useState('')
  const [selectedPendingMatch, setSelectedPendingMatch] = useState<string>('')
  const [loadingMatches, setLoadingMatches] = useState(false)

  // Estado para partido y sets
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null)
  const [sets, setSets] = useState<SetCreate[]>([])
  const [setCounter, setSetCounter] = useState(1)
  const [isMatchPrepared, setIsMatchPrepared] = useState(false) // Indica si el match está preparado localmente
  const [isSubmitting, setIsSubmitting] = useState(false) // Indica si se está enviando a la API

  // Estado para modal de autenticación
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [player1Password, setPlayer1Password] = useState('')
  const [player2Password, setPlayer2Password] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Estado para alertas
  const [matchAlert, setMatchAlert] = useState<{ message: string; type: string } | null>(null)
  const [setsAlert, setSetsAlert] = useState<{ message: string; type: string } | null>(null)

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchData()
  }, [])

  // Actualizar jugadores filtrados cuando cambia la búsqueda
  useEffect(() => {
    if (playerSearch === '') {
      setFilteredPlayers([...players])
    } else {
      const filtered = players.filter(player =>
        `${player.first_name} ${player.last_name}`.toLowerCase().includes(playerSearch.toLowerCase())
      )
      setFilteredPlayers(filtered)
    }
  }, [playerSearch, players])

  // Actualizar opciones de jugador 1 cuando cambia el torneo o la búsqueda
  useEffect(() => {
    if (!matchTournament) {
      setFilteredPlayer1Options([])
      return
    }

    const inscribedPlayerCIs = inscriptions
      .filter(ins => ins.tournament_id === parseInt(matchTournament))
      .map(ins => ins.player_ci)

    const filtered = players.filter(player => {
      const isInscribed = inscribedPlayerCIs.includes(player.ci)
      const matchesSearch = player1Search === '' ||
        `${player.first_name} ${player.last_name}`.toLowerCase().includes(player1Search.toLowerCase())
      return isInscribed && matchesSearch
    })

    setFilteredPlayer1Options(filtered)
  }, [matchTournament, player1Search, players, inscriptions])

  // Actualizar opciones de jugador 2 cuando cambia el torneo o la búsqueda
  useEffect(() => {
    if (!matchTournament) {
      setFilteredPlayer2Options([])
      return
    }

    const inscribedPlayerCIs = inscriptions
      .filter(ins => ins.tournament_id === parseInt(matchTournament))
      .map(ins => ins.player_ci)

    const filtered = players.filter(player => {
      const isInscribed = inscribedPlayerCIs.includes(player.ci)
      const matchesSearch = player2Search === '' ||
        `${player.first_name} ${player.last_name}`.toLowerCase().includes(player2Search.toLowerCase())
      return isInscribed && matchesSearch
    })

    setFilteredPlayer2Options(filtered)
  }, [matchTournament, player2Search, players, inscriptions])

  // Cargar matches pendientes cuando se selecciona un torneo con ID >= 3
  useEffect(() => {
    const fetchPendingMatches = async () => {
      if (!matchTournament) {
        setPendingMatches([])
        setFilteredPendingMatches([])
        setSelectedPendingMatch('')
        return
      }

      const tournamentId = parseInt(matchTournament)

      // Solo cargar matches para torneos con ID >= 3
      if (tournamentId < 3) {
        setPendingMatches([])
        setFilteredPendingMatches([])
        setSelectedPendingMatch('')
        return
      }

      setLoadingMatches(true)
      try {
        const apiUrl = getApiUrl()
        const matchesResponse = await fetch(`${apiUrl}/match/tournament/${tournamentId}`)

        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json()

          // Filtrar por status 'Pendiente' Y por tournament_id para mayor seguridad
          const pending = (matchesData.data || []).filter((m: Match) => {
            const isPending = m.status === 'Pendiente'
            const isCorrectTournament = m.tournament_id === tournamentId
            return isPending && isCorrectTournament
          })

          setPendingMatches(pending)
          setFilteredPendingMatches(pending) // Inicializar también los filtrados
        } else {
          // Si el endpoint específico falla, intentar con el endpoint general
          try {
            const fallbackResponse = await fetch(`${apiUrl}/match`)

            if (fallbackResponse.ok) {
              const allMatchesData = await fallbackResponse.json()

              const pendingForTournament = (allMatchesData.data || []).filter((m: Match) => {
                const isPending = m.status === 'Pendiente'
                const isCorrectTournament = m.tournament_id === tournamentId
                return isPending && isCorrectTournament
              })

              setPendingMatches(pendingForTournament)
              setFilteredPendingMatches(pendingForTournament)
            } else {
              setPendingMatches([])
              setFilteredPendingMatches([])
            }
          } catch (fallbackError) {
            setPendingMatches([])
            setFilteredPendingMatches([])
          }
        }
      } catch (error) {
        setPendingMatches([])
        setFilteredPendingMatches([])
      } finally {
        setLoadingMatches(false)
      }
    }

    fetchPendingMatches()
  }, [matchTournament])

  // Limpiar selecciones cuando cambia el torneo
  useEffect(() => {
    if (matchTournament) {
      setPlayer1('')
      setPlayer2('')
      setSelectedPendingMatch('')
      setPlayer1Search('')
      setPlayer2Search('')
      setMatchSearch('')
    }
  }, [matchTournament])

  // Filtrar matches pendientes según búsqueda
  useEffect(() => {
    if (matchSearch === '') {
      setFilteredPendingMatches(pendingMatches)
    } else {
      const filtered = pendingMatches.filter(match => {
        const inscription1 = inscriptions.find(ins => ins.inscription_id === match.inscription1_id)
        const inscription2 = inscriptions.find(ins => ins.inscription_id === match.inscription2_id)

        if (!inscription1 || !inscription2) return false

        const player1Name = `${inscription1.player.first_name} ${inscription1.player.last_name}`.toLowerCase()
        const player2Name = `${inscription2.player.first_name} ${inscription2.player.last_name}`.toLowerCase()
        const searchLower = matchSearch.toLowerCase()

        return player1Name.includes(searchLower) || player2Name.includes(searchLower)
      })
      setFilteredPendingMatches(filtered)
    }
  }, [matchSearch, pendingMatches, inscriptions])

  // Actualizar jugadores cuando se selecciona un match pendiente
  useEffect(() => {
    if (!selectedPendingMatch || !matchTournament) {
      return
    }

    const tournamentId = parseInt(matchTournament)
    if (tournamentId < 3) return

    const match = pendingMatches.find(m => m.match_id === parseInt(selectedPendingMatch))
    if (!match) return

    // Encontrar las inscripciones del match
    const inscription1 = inscriptions.find(ins => ins.inscription_id === match.inscription1_id)
    const inscription2 = inscriptions.find(ins => ins.inscription_id === match.inscription2_id)

    if (inscription1 && inscription2) {
      setPlayer1(inscription1.player_ci)
      setPlayer2(inscription2.player_ci)
    }
  }, [selectedPendingMatch, pendingMatches, inscriptions, matchTournament])

  async function fetchData() {
    try {
      setLoading(true)
      const apiUrl = getApiUrl()

      const [playersRes, tournamentsRes, inscriptionsRes] = await Promise.all([
        fetch(`${apiUrl}/player`),
        fetch(`${apiUrl}/tournament`),
        fetch(`${apiUrl}/inscription`)
      ])

      const playersData = await playersRes.json()
      const tournamentsData = await tournamentsRes.json()
      const inscriptionsData = await inscriptionsRes.json()

      setPlayers(playersData.data)
      setTournaments(tournamentsData.data)
      setInscriptions(inscriptionsData.data)
      setFilteredPlayers(playersData.data)

      setLoading(false)
    } catch (error) {
      console.error('Error al cargar los datos:', error)
      setLoading(false)
    }
  }

  function handleCreateMatch() {
    const tournamentId = parseInt(matchTournament)

    // Para torneos con ID >= 3, usar match pendiente existente
    if (tournamentId >= 3) {
      if (!selectedPendingMatch) {
        showMatchAlert('Por favor, selecciona un partido pendiente.', 'error')
        return
      }

      const match = pendingMatches.find(m => m.match_id === parseInt(selectedPendingMatch))
      if (!match) {
        showMatchAlert('No se encontró el partido seleccionado.', 'error')
        return
      }

      // Usar el match existente
      setCurrentMatch(match)
      setIsMatchPrepared(true)
      setSetCounter(1)
      setSets([])
      showMatchAlert('Partido cargado. Ahora puedes agregar los sets y luego confirmar.', 'success')
      return
    }

    // Lógica original para torneos con ID 1 y 2
    if (!player1 || !player2 || !matchTournament) {
      showMatchAlert('Por favor, selecciona ambos jugadores y un torneo.', 'error')
      return
    }

    if (player1 === player2) {
      showMatchAlert('Los jugadores deben ser diferentes.', 'error')
      return
    }

    const player1Inscription = inscriptions.find(ins =>
      ins.player_ci === player1 && ins.tournament_id === tournamentId
    )

    const player2Inscription = inscriptions.find(ins =>
      ins.player_ci === player2 && ins.tournament_id === tournamentId
    )

    if (!player1Inscription) {
      showMatchAlert('El jugador 1 no está inscrito en este torneo.', 'error')
      return
    }

    if (!player2Inscription) {
      showMatchAlert('El jugador 2 no está inscrito en este torneo.', 'error')
      return
    }

    const tournament = tournaments.find(t => t.tournament_id === tournamentId)
    let round = "Libre"
    if (tournament?.format === "Liga") {
      round = "Liga"
    }

    // Crear un match temporal (local) sin enviarlo a la API todavía
    const matchData = {
      match_id: 0, // Temporal, se asignará al confirmar
      tournament_id: tournamentId,
      inscription1_id: player1Inscription.inscription_id,
      inscription2_id: player2Inscription.inscription_id,
      winner_inscription_id: null,
      match_datetime: new Date().toISOString(),
      round: round,
      status: "Pendiente",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sets: []
    } as Match

    setCurrentMatch(matchData)
    setIsMatchPrepared(true)
    setSetCounter(1)

    // Para torneo ID 2, agregar automáticamente 1 set
    if (tournamentId === 2) {
      setSets([{ set_number: 1, score_participant1: 0, score_participant2: 0 }])
    } else {
      setSets([])
    }

    showMatchAlert(
      tournamentId === 2
        ? 'Partido preparado. Ahora puedes registrar el set y luego confirmar.'
        : 'Partido preparado. Ahora puedes agregar los sets y luego confirmar.',
      'success'
    )
  }

  function addSet() {
    const tournamentId = parseInt(matchTournament)

    // Para torneo ID 2, solo se permite 1 set
    if (tournamentId === 2) {
      showSetsAlert('Para el torneo seleccionado solo se permite 1 set.', 'error')
      return
    }

    if (setCounter > 10) {
      showSetsAlert('No se pueden agregar más de 10 sets.', 'error')
      return
    }

    setSets([...sets, { set_number: setCounter, score_participant1: 0, score_participant2: 0 }])
    setSetCounter(setCounter + 1)
  }

  function removeSet(index: number) {
    const tournamentId = parseInt(matchTournament)

    // Para torneo ID 2, no se puede eliminar el único set
    if (tournamentId === 2 && sets.length === 1) {
      showSetsAlert('Para el torneo seleccionado no se puede eliminar el set.', 'error')
      return
    }

    const newSets = sets.filter((_, i) => i !== index)
    const reorganizedSets = newSets.map((set, i) => ({ ...set, set_number: i + 1 } as SetCreate))
    setSets(reorganizedSets)
    setSetCounter(reorganizedSets.length + 1)
  }

  function updateSetScore(index: number, field: 'score_participant1' | 'score_participant2', value: number) {
    const newSets = [...sets]
    newSets[index][field] = value
    setSets(newSets)
  }

  function handleConfirmMatch() {
    if (!currentMatch) {
      showSetsAlert('No hay un partido preparado.', 'error')
      return
    }

    const tournamentId = currentMatch.tournament_id

    // Para torneo ID 2, debe haber exactamente 1 set
    if (tournamentId === 2 && sets.length !== 1) {
      showSetsAlert('Para este torneo debe haber exactamente 1 set.', 'error')
      return
    }

    // Para otros torneos, debe haber al menos 1 set
    if (tournamentId !== 2 && sets.length === 0) {
      showSetsAlert('Debes agregar al menos un set antes de confirmar.', 'error')
      return
    }

    const validSets = sets.every(set => !isNaN(set.score_participant1) && !isNaN(set.score_participant2))

    if (!validSets) {
      showSetsAlert('Todos los sets deben tener puntuaciones válidas.', 'error')
      return
    }

    // Abrir modal de autenticación
    setAuthError(null)
    setPlayer1Password('')
    setPlayer2Password('')
    setShowAuthModal(true)
  }

  async function handleAuthenticateAndSubmit() {
    if (!player1Password || !player2Password) {
      setAuthError('Por favor, ingresa ambas contraseñas.')
      return
    }

    setIsAuthenticating(true)
    setAuthError(null)

    try {
      const apiUrl = getApiUrl()

      // Autenticar Jugador 1
      const auth1Response = await fetch(`${apiUrl}/credential/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_ci: player1, password: player1Password })
      })

      if (!auth1Response.ok) {
        const error = await auth1Response.json()
        throw new Error(`Error al autenticar a ${player1Data?.first_name}: ${error.message || 'Contraseña incorrecta'}`)
      }

      // Autenticar Jugador 2
      const auth2Response = await fetch(`${apiUrl}/credential/authenticate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_ci: player2, password: player2Password })
      })

      if (!auth2Response.ok) {
        const error = await auth2Response.json()
        throw new Error(`Error al autenticar a ${player2Data?.first_name}: ${error.message || 'Contraseña incorrecta'}`)
      }

      // Si ambas autenticaciones son exitosas, proceder a crear el partido
      setShowAuthModal(false)
      await submitMatch()

    } catch (error: any) {
      console.error('Error de autenticación:', error)
      setAuthError(error.message || 'Error al autenticar a los jugadores')
    } finally {
      setIsAuthenticating(false)
    }
  }

  async function submitMatch() {
    if (!currentMatch) return

    setIsSubmitting(true)

    try {
      const apiUrl = getApiUrl()
      let matchId: number

      // Determinar si es un torneo que requiere crear match o actualizar existente
      const tournamentId = currentMatch.tournament_id

      if (tournamentId >= 3) {
        // Para torneos >= 3, usar el match existente (ya tiene match_id)
        matchId = currentMatch.match_id
      } else {
        // Para torneos 1 y 2, crear el match en la API
        const matchData = {
          tournament_id: currentMatch.tournament_id,
          inscription1_id: currentMatch.inscription1_id,
          inscription2_id: currentMatch.inscription2_id,
          winner_inscription_id: null,
          match_datetime: currentMatch.match_datetime,
          round: currentMatch.round,
          status: "Pendiente"
        }

        const matchResponse = await fetch(`${apiUrl}/match`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(matchData)
        })

        if (!matchResponse.ok) {
          const error = await matchResponse.json()
          throw new Error(`Error al crear el partido: ${error.message}`)
        }

        const matchResult = await matchResponse.json()
        matchId = matchResult.data.match_id
      }

      // Paso 2: Crear los sets
      for (const set of sets) {
        const setData = {
          match_id: matchId,
          set_number: set.set_number,
          score_participant1: set.score_participant1,
          score_participant2: set.score_participant2
        }

        const setResponse = await fetch(`${apiUrl}/set`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(setData)
        })

        if (!setResponse.ok) {
          const error = await setResponse.json()
          throw new Error(`Error al crear set ${set.set_number}: ${error.message}`)
        }
      }

      // Paso 3: Calcular y actualizar el ganador
      const winnerInscriptionId = calculateWinner()

      const updateResponse = await fetch(`${apiUrl}/match/${matchId}/result`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner_inscription_id: winnerInscriptionId })
      })

      if (!updateResponse.ok) {
        const error = await updateResponse.json()
        throw new Error(`Error al actualizar el ganador: ${error.message}`)
      }

      // Éxito - limpiar todo
      showSetsAlert(
        currentMatch.tournament_id === 2
          ? '¡Set completado exitosamente!'
          : '¡Partido completado exitosamente con todos sus sets!',
        'success'
      )
      
      setTimeout(() => {
        setCurrentMatch(null)
        setSets([])
        setSetCounter(1)
        setIsMatchPrepared(false)
        setPlayer1('')
        setPlayer2('')
        setMatchTournament('')
        setSelectedPendingMatch('')
        setPlayer1Password('')
        setPlayer2Password('')
        setPlayer1Search('')
        setPlayer2Search('')
        setMatchSearch('')
        setSetsAlert(null)
        setMatchAlert(null)
      }, 3000)

    } catch (error: any) {
      console.error('Error:', error)
      showSetsAlert(error.message || 'Error al confirmar el partido', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  function calculateWinner() {
    let player1Wins = 0
    let player2Wins = 0

    sets.forEach(set => {
      if (set.score_participant1 > set.score_participant2) player1Wins++
      else if (set.score_participant2 > set.score_participant1) player2Wins++
    })

    const player1Inscription = inscriptions.find(ins => ins.player_ci === player1 && ins.tournament_id === parseInt(matchTournament))
    const player2Inscription = inscriptions.find(ins => ins.player_ci === player2 && ins.tournament_id === parseInt(matchTournament))

    if (player1Wins > player2Wins) return player1Inscription?.inscription_id || null
    else if (player2Wins > player1Wins) return player2Inscription?.inscription_id || null
    else return null
  }

  function showMatchAlert(message: string, type: string) {
    setMatchAlert({ message, type })
    setTimeout(() => setMatchAlert(null), 5000)
  }

  function showSetsAlert(message: string, type: string) {
    setSetsAlert({ message, type })
    setTimeout(() => setSetsAlert(null), 5000)
  }

  function handleCancelMatch() {
    setCurrentMatch(null)
    setSets([])
    setSetCounter(1)
    setIsMatchPrepared(false)
    setSelectedPendingMatch('')
    setPlayer1Password('')
    setPlayer2Password('')
    setPlayer1Search('')
    setPlayer2Search('')
    setMatchSearch('')
    setSetsAlert(null)
    showMatchAlert('Partido cancelado. Puedes crear uno nuevo.', 'info')
  }

  const selectedPlayerData = players.find(p => p.ci === selectedPlayer)
  const selectedTournamentData = tournaments.find(t => t.tournament_id === parseInt(selectedTournament))
  const player1Data = players.find(p => p.ci === player1)
  const player2Data = players.find(p => p.ci === player2)
  const currentTournamentData = tournaments.find(t => t.tournament_id === parseInt(matchTournament))

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-slate-600 border-t-purple-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Cargando datos...</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      <style jsx>{`
        .section-title::after {
          content: '';
          display: block;
          width: 80px;
          height: 4px;
          background-color: #a855f7;
          margin: 0.5rem auto;
          border-radius: 2px;
        }
      `}</style>

      {/* --------- Cards de información 
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
         ------Card de Jugadores 
        <div className="bg-slate-800/50 rounded-xl shadow-lg overflow-hidden border border-slate-700 hover:border-purple-500/50 transition-all hover:shadow-purple-500/10">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4">
            <h3 className="text-xl font-semibold text-white text-center">Jugadores</h3>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-slate-300">Selecciona un jugador:</label>
              <div className="relative mb-2">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input
                  type="text"
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                />
              </div>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
              >
                <option value="">-- Selecciona un jugador --</option>
                {filteredPlayers.map(player => (
                  <option key={player.ci} value={player.ci}>
                    {player.first_name} {player.last_name} ({player.ci})
                  </option>
                ))}
              </select>
              <div className="text-sm text-slate-400 mt-2 text-right">
                {filteredPlayers.length} jugadores encontrados
              </div>
            </div>

            {selectedPlayerData && (
              <div className="bg-slate-700/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between pb-2 border-b border-slate-600">
                  <span className="font-semibold text-slate-300">Nombre:</span>
                  <span className="text-white">{selectedPlayerData.first_name} {selectedPlayerData.last_name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-600">
                  <span className="font-semibold text-slate-300">Cédula:</span>
                  <span className="text-white">{selectedPlayerData.ci}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-600">
                  <span className="font-semibold text-slate-300">Teléfono:</span>
                  <span className="text-white">{selectedPlayerData.phone}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-600">
                  <span className="font-semibold text-slate-300">Semestre:</span>
                  <span className="text-white">{selectedPlayerData.semester}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-600">
                  <span className="font-semibold text-slate-300">Aura:</span>
                  <span className="inline-block px-3 py-1 bg-yellow-500 text-white rounded-full text-sm font-bold">
                    {selectedPlayerData.aura}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-600">
                  <span className="font-semibold text-slate-300">Estado:</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${selectedPlayerData.status ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {selectedPlayerData.status ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="font-semibold text-slate-300">Días disponibles:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlayerData.Days && selectedPlayerData.Days.length > 0 ? (
                      selectedPlayerData.Days.map((day: Day, i: number) => (
                        <span key={i} className="px-3 py-1 bg-purple-500 text-white rounded-full text-xs">
                          {day.day_name}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">No especificados</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>*/}

        {/* Card de Torneos 
        <div className="bg-slate-800/50 rounded-xl shadow-lg overflow-hidden border border-slate-700 hover:border-purple-500/50 transition-all hover:shadow-purple-500/10">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4">
            <h3 className="text-xl font-semibold text-white text-center">Torneos</h3>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-slate-300">Selecciona un torneo:</label>
              <select
                value={selectedTournament}
                onChange={(e) => setSelectedTournament(e.target.value)}
                className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
              >
                <option value="">-- Selecciona un torneo --</option>
                {tournaments.map(tournament => (
                  <option key={tournament.tournament_id} value={tournament.tournament_id}>
                    {tournament.name} ({tournament.format})
                  </option>
                ))}
              </select>
            </div>

            {selectedTournamentData && (
              <div className="bg-slate-700/50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between pb-2 border-b border-slate-600">
                  <span className="font-semibold text-slate-300">Nombre:</span>
                  <span className="text-white">{selectedTournamentData.name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-600">
                  <span className="font-semibold text-slate-300">Descripción:</span>
                  <span className="text-white">{selectedTournamentData.description}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-600">
                  <span className="font-semibold text-slate-300">Tipo:</span>
                  <span className="text-white">{selectedTournamentData.tournament_type}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-600">
                  <span className="font-semibold text-slate-300">Formato:</span>
                  <span className="text-white">{selectedTournamentData.format}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-600">
                  <span className="font-semibold text-slate-300">Fecha de inicio:</span>
                  <span className="text-white">{new Date(selectedTournamentData.start_date).toLocaleDateString('es-ES')}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-600">
                  <span className="font-semibold text-slate-300">Fecha de fin:</span>
                  <span className="text-white">
                    {selectedTournamentData.end_date ? new Date(selectedTournamentData.end_date).toLocaleDateString('es-ES') : 'No definida'}
                  </span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="font-semibold text-slate-300">Estado:</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${selectedTournamentData.status === 'En Curso' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                    {selectedTournamentData.status}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div> */}

      {/* Sección de crear partido */}
      <div className="bg-slate-800/50 rounded-xl shadow-lg p-8 mb-8 border border-slate-700">
        <h2 className="text-3xl font-bold text-center mb-8 text-white section-title">Crear Partido</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block mb-2 font-semibold text-slate-300">Torneo:</label>
            <select
              value={matchTournament}
              onChange={(e) => setMatchTournament(e.target.value)}
              className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
            >
              <option value="">Selecciona un torneo</option>
              {tournaments.map(tournament => (
                <option key={tournament.tournament_id} value={tournament.tournament_id}>
                  {tournament.name} ({tournament.format})
                </option>
              ))}
            </select>
          </div>

          {/* Para torneos con ID >= 3: Seleccionar match pendiente */}
          {matchTournament && parseInt(matchTournament) >= 3 ? (
            <div className="md:col-span-2">
              <label className="block mb-2 font-semibold text-slate-300">Partido Pendiente:</label>
              {loadingMatches ? (
                <div className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-slate-400 text-center">
                  Cargando partidos...
                </div>
              ) : pendingMatches.length === 0 ? (
                <div className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-slate-400 text-center">
                  No hay partidos pendientes en este torneo
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={matchSearch}
                    onChange={(e) => setMatchSearch(e.target.value)}
                    placeholder="Buscar partido por nombre de jugador"
                    className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                  />
                  <select
                    value={selectedPendingMatch}
                    onChange={(e) => setSelectedPendingMatch(e.target.value)}
                    className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"
                  >
                    <option value="">Selecciona un partido</option>
                    {filteredPendingMatches.map(match => {
                      const inscription1 = inscriptions.find(ins => ins.inscription_id === match.inscription1_id)
                      const inscription2 = inscriptions.find(ins => ins.inscription_id === match.inscription2_id)
                      if (!inscription1 || !inscription2) return null
                      
                      return (
                        <option key={match.match_id} value={match.match_id}>
                          {inscription1.player.first_name} {inscription1.player.last_name} vs {inscription2.player.first_name} {inscription2.player.last_name} - {match.round}
                        </option>
                      )
                    })}
                  </select>
                  {filteredPendingMatches.length === 0 && matchSearch && (
                    <p className="text-sm text-slate-400 text-center">
                      No se encontraron partidos con ese nombre
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Para torneos con ID 1 y 2: Seleccionar jugadores */
            <>
              <div>
                <label className="block mb-2 font-semibold text-slate-300">Jugador 1:</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={player1Search}
                    onChange={(e) => setPlayer1Search(e.target.value)}
                    placeholder="Buscar jugador 1"
                    disabled={!matchTournament}
                    className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white disabled:opacity-50"
                  />
                  <select
                    value={player1}
                    onChange={(e) => setPlayer1(e.target.value)}
                    disabled={!matchTournament}
                    className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white disabled:opacity-50"
                  >
                    <option value="">{matchTournament ? 'Selecciona un jugador' : 'Primero selecciona un torneo'}</option>
                    {filteredPlayer1Options.map(player => (
                      <option key={player.ci} value={player.ci}>
                        {player.first_name} {player.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-slate-300">Jugador 2:</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={player2Search}
                    onChange={(e) => setPlayer2Search(e.target.value)}
                    placeholder="Buscar jugador 2"
                    disabled={!matchTournament}
                    className="w-full px-4 py-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white disabled:opacity-50"
                  />
                  <select
                    value={player2}
                    onChange={(e) => setPlayer2(e.target.value)}
                    disabled={!matchTournament}
                    className="w-full p-3 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white disabled:opacity-50"
                  >
                    <option value="">{matchTournament ? 'Selecciona un jugador' : 'Primero selecciona un torneo'}</option>
                    {filteredPlayer2Options.map(player => (
                      <option key={player.ci} value={player.ci}>
                        {player.first_name} {player.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center">
          <Button
            variant="outstanding"
            disabled={
              !matchTournament || 
              isMatchPrepared ||
              (parseInt(matchTournament) >= 3 ? !selectedPendingMatch : (!player1 || !player2))
            }
            onClick={handleCreateMatch}
            className="cursor-pointer w-1/2 gap-4 rounded-lg"
          >
            {isMatchPrepared ? 'Partido Preparado ✓' : (parseInt(matchTournament) >= 3 ? 'Cargar Partido' : 'Crear Partido')}
          </Button>
        </div>

        {matchAlert && (
          <div className={`mt-4 p-4 rounded-lg ${
            matchAlert.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
            matchAlert.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
            'bg-blue-500/20 text-blue-300 border border-blue-500/50'
          }`}>
            {matchAlert.message}
          </div>
        )}
      </div>

      {/* Sección de gestión de sets */}
      {isMatchPrepared && currentMatch && (
        <div className="bg-slate-800/50 rounded-xl shadow-lg p-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-center mb-8 text-white section-title">
            {currentMatch.tournament_id === 2 ? 'Registrar Set del Partido' : 'Agregar Sets al Partido'}
          </h2>

          <div className="bg-slate-700/50 p-6 rounded-lg mb-6">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-xl font-semibold text-white">Información del Partido</h4>
              <Button onClick={handleCancelMatch} variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                Cancelar
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="font-semibold text-slate-300">Torneo:</span><span className="text-white">{currentTournamentData?.name}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-300">Jugador 1:</span><span className="text-white">{player1Data?.first_name} {player1Data?.last_name}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-300">Jugador 2:</span><span className="text-white">{player2Data?.first_name} {player2Data?.last_name}</span></div>
              <div className="flex justify-between"><span className="font-semibold text-slate-300">Round:</span><span className="text-white">{currentMatch.round}</span></div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-white">
              {currentMatch.tournament_id === 2 ? 'Registrar Set' : 'Registrar Sets'}
            </h3>

            <div className={`grid gap-4 mb-4 font-semibold text-slate-300 ${currentMatch.tournament_id === 2 ? 'grid-cols-3' : 'grid-cols-4'}`}>
              <div>Set</div>
              <div>{player1Data?.first_name}</div>
              <div>{player2Data?.first_name}</div>
              {currentMatch.tournament_id !== 2 && <div>Acciones</div>}
            </div>

            <div className="space-y-4">
              {sets.map((set, index) => (
                <div key={index} className={`grid gap-4 items-center ${currentMatch.tournament_id === 2 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                  <label className="text-white font-medium">Set {set.set_number}</label>
                  <input type="text" min="0" max="50" value={set.score_participant1} onChange={(e) => updateSetScore(index, 'score_participant1', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)} placeholder="Puntuación" className="p-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"/>
                  <input type="text" min="0" max="50" value={set.score_participant2} onChange={(e) => updateSetScore(index, 'score_participant2', parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0)} placeholder="Puntuación" className="p-2 bg-slate-700 border-2 border-slate-600 rounded-lg focus:border-purple-500 focus:outline-none text-white"/>
                  {currentMatch.tournament_id !== 2 && (
                    <Button onClick={() => removeSet(index)} variant="destructive" className="font-semibold">Eliminar</Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-6">
              {currentMatch.tournament_id !== 2 && (
                <Button onClick={addSet} variant="secondary" className="flex-1 font-semibold py-6">Agregar Set</Button>
              )}
              <Button
                onClick={handleConfirmMatch}
                variant="outstanding"
                disabled={currentMatch.tournament_id === 2 ? isSubmitting : (sets.length === 0 || isSubmitting)}
                className="flex-1 font-semibold py-6"
              >
                {isSubmitting ? 'Guardando...' : (currentMatch.tournament_id === 2 ? 'Confirmar Set' : 'Confirmar Sets')}
              </Button>
            </div>
          </div>

          {setsAlert && (
            <div className={`p-4 rounded-lg ${
              setsAlert.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
              setsAlert.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
              'bg-blue-500/20 text-blue-300 border border-blue-500/50'
            }`}>
              {setsAlert.message}
            </div>
          )}
        </div>
      )}

      {/* Modal de Autenticación */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-[500px] bg-[#2A2A3E] border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-2xl text-purple-400">Autenticación de Jugadores</DialogTitle>
            <DialogDescription className="text-slate-400">
              Para confirmar el partido, ambos jugadores deben autenticarse con su contraseña.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Jugador 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <h4 className="text-lg font-semibold text-white">
                  {player1Data?.first_name} {player1Data?.last_name}
                </h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="player1-password" className="text-slate-300">
                  Contraseña
                </Label>
                <Input
                  id="player1-password"
                  type="password"
                  placeholder="Ingresa la contraseña"
                  value={player1Password}
                  onChange={(e) => setPlayer1Password(e.target.value)}
                  disabled={isAuthenticating}
                  className="bg-slate-700 border-slate-600 text-white focus:border-purple-500"
                />
              </div>
            </div>

            {/* Jugador 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <h4 className="text-lg font-semibold text-white">
                  {player2Data?.first_name} {player2Data?.last_name}
                </h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="player2-password" className="text-slate-300">
                  Contraseña
                </Label>
                <Input
                  id="player2-password"
                  type="password"
                  placeholder="Ingresa la contraseña"
                  value={player2Password}
                  onChange={(e) => setPlayer2Password(e.target.value)}
                  disabled={isAuthenticating}
                  className="bg-slate-700 border-slate-600 text-white focus:border-purple-500"
                />
              </div>
            </div>

            {/* Error de autenticación */}
            {authError && (
              <div className="p-3 rounded-lg bg-red-500/20 text-red-300 border border-red-500/50 text-sm">
                {authError}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAuthModal(false)}
              disabled={isAuthenticating}
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              Cancelar
            </Button>
            <Button
              variant="outstanding"
              onClick={handleAuthenticateAndSubmit}
              disabled={isAuthenticating || !player1Password || !player2Password}
            >
              {isAuthenticating ? 'Autenticando...' : 'Autenticar y Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
