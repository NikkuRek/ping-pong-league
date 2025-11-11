"use client"

import React, { useState, useEffect } from 'react'
import type { PlayerBackendResponse, Tournament, Inscription } from '@/types'
import { Button } from '@/components/ui/button'
import { getApiUrl } from '@/lib/api-config'
import { PlayerSelection } from '@/components/ui/player-selection'
import { useToast } from '@/components/ui/use-toast'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'

type PlayerWithDays = PlayerBackendResponse

export default function MatchCreationAdminPage() {
  const [players, setPlayers] = useState<PlayerWithDays[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [loading, setLoading] = useState(false)

  const [player1Search, setPlayer1Search] = useState('')
  const [player2Search, setPlayer2Search] = useState('')
  const [filteredPlayer1Options, setFilteredPlayer1Options] = useState<PlayerWithDays[]>([])
  const [filteredPlayer2Options, setFilteredPlayer2Options] = useState<PlayerWithDays[]>([])

  const [player1, setPlayer1] = useState('')
  const [player2, setPlayer2] = useState('')
  const [matchTournament, setMatchTournament] = useState('')
  const [round, setRound] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Admin authentication state
  const [adminCi, setAdminCi] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [adminFailedAttempts, setAdminFailedAttempts] = useState(0)
  // Allow viewing this admin page without requiring a sign-in.
  // Previously the page required an admin login; set default to true so the
  // page data is loaded and the creation UI is visible without authentication.
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(true)

  const allowedAdminCis = new Set([
    '29944901',
    '29909792',
    '30803929',
    '30979752',
    '31366298',
    '30353315',
  ])

  const { toast } = useToast()

    useEffect(() => {
      if (isAdminAuthenticated) {
        fetchData()
      }
    }, [isAdminAuthenticated])

  useEffect(() => {
    if (!matchTournament) {
      setFilteredPlayer1Options([])
      setFilteredPlayer2Options([])
      return
    }

    const inscribedPlayerCIs = inscriptions
      .filter(ins => ins.tournament_id === parseInt(matchTournament))
      .map(ins => ins.player_ci)

    const inscribedPlayers = players.filter(player => inscribedPlayerCIs.includes(player.ci))

    const filterPlayers = (search: string) => {
      if (search === '') {
        return inscribedPlayers
      }
      return inscribedPlayers.filter(player =>
        `${player.first_name} ${player.last_name}`.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredPlayer1Options(filterPlayers(player1Search))
    setFilteredPlayer2Options(filterPlayers(player2Search))
  }, [matchTournament, player1Search, player2Search, players, inscriptions])

  useEffect(() => {
    if (matchTournament) {
      setPlayer1('')
      setPlayer2('')
      setPlayer1Search('')
      setPlayer2Search('')
      setRound('')
    }
  }, [matchTournament])

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

      setLoading(false)
    } catch (error) {
      console.error('Error al cargar los datos:', error)
      setLoading(false)
    }
  }

  async function handleAdminSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (adminFailedAttempts >= 3) {
      toast({
        title: 'Cuenta bloqueada',
        description: 'Demasiados intentos fallidos. Por favor, contacta a un administrador.',
        variant: 'destructive',
      })
      return
    }

    setAdminLoading(true)

    try {
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/credential/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ player_ci: adminCi, password: adminPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        // Check if this CI is allowed as admin for this module
        if (!allowedAdminCis.has(adminCi)) {
          toast({ title: 'No autorizado', description: 'Tu usuario no tiene permisos para este módulo.', variant: 'destructive' })
          return
        }

        setAdminFailedAttempts(0)
        setIsAdminAuthenticated(true)
        toast({ title: 'Acceso concedido', description: 'Bienvenido administrador.' })
      } else {
        setAdminFailedAttempts((prev) => prev + 1)
        let errorMessage = data.message || 'Credenciales inválidas. Inténtalo de nuevo.'

        if (adminFailedAttempts + 1 >= 3) {
          errorMessage = 'Demasiados intentos fallidos. Por favor, contacta a un administrador.'
        } else {
          errorMessage += ` Te quedan ${3 - (adminFailedAttempts + 1)} intentos.`
        }

        toast({ title: 'Error de autenticación', description: errorMessage, variant: 'destructive' })
        console.error('Error en la autenticación:', data)
      }
    } catch (err) {
      toast({ title: 'Error de red', description: 'No se pudo conectar con el servidor. Verifica tu conexión.', variant: 'destructive' })
      console.error('Error de red:', err)
    } finally {
      setAdminLoading(false)
    }
  }

  async function handleCreateMatch() {
    if (!player1 || !player2 || !matchTournament || !round) {
      toast({ title: 'Error', description: 'Por favor, completa todos los campos.', variant: 'destructive' })
      return
    }

    if (player1 === player2) {
      toast({ title: 'Error', description: 'Los jugadores deben ser diferentes.', variant: 'destructive' })
      return
    }

    const tournamentId = parseInt(matchTournament)
    const player1Inscription = inscriptions.find(ins =>
      ins.player_ci === player1 && ins.tournament_id === tournamentId
    )

    const player2Inscription = inscriptions.find(ins =>
      ins.player_ci === player2 && ins.tournament_id === tournamentId
    )

    if (!player1Inscription) {
      toast({ title: 'Error', description: 'El jugador 1 no está inscrito en este torneo.', variant: 'destructive' })
      return
    }

    if (!player2Inscription) {
      toast({ title: 'Error', description: 'El jugador 2 no está inscrito en este torneo.', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)

    try {
      const apiUrl = getApiUrl()
      const matchData = {
        tournament_id: tournamentId,
        inscription1_id: player1Inscription.inscription_id,
        inscription2_id: player2Inscription.inscription_id,
        winner_inscription_id: null,
        match_datetime: new Date().toISOString(),
        round: round,
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

      toast({
        title: 'Éxito',
        description: '¡Partido creado exitosamente!',
      })
      
      setTimeout(() => {
        setPlayer1('')
        setPlayer2('')
        setMatchTournament('')
        setRound('')
        setPlayer1Search('')
        setPlayer2Search('')
      }, 3000)

    } catch (error: any) {
      console.error('Error:', error)
      toast({ title: 'Error', description: error.message || 'Error al crear el partido', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAdminAuthenticated) {
    const isFormDisabled = adminLoading || adminFailedAttempts >= 3

    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md bg-[#2A2A3E]">
          <CardHeader className="text-center">
            <h1 className="text-2xl text-purple-400 font-bold">Acceso Administrador</h1>
            <p className="text-slate-400 text-sm">Ingresa tus credenciales para acceder a este módulo.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAdminSubmit}>
              <div className="space-y-2 text-slate-200">
                <Label htmlFor="admin_ci">Cédula</Label>
                <Input
                  id="admin_ci"
                  type="text"
                  required
                  value={adminCi}
                  onChange={(e) => setAdminCi(e.target.value)}
                  disabled={isFormDisabled}
                />
              </div>
              <div className="space-y-2 text-slate-200 mt-4">
                <Label htmlFor="admin_password">Contraseña</Label>
                <Input
                  id="admin_password"
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  disabled={isFormDisabled}
                />
              </div>
              <Button
                type="submit"
                className="cursor-pointer w-full gap-4 rounded-lg flex items-center justify-center mt-6"
                variant="outstanding"
                disabled={isFormDisabled}
              >
                {adminLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-sm text-slate-400">Sólo administradores autorizados pueden acceder a este módulo.</p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-slate-400">Cargando datos...</p>
      </div>
    )
  }

  return (
    <div className="py-8">

      <div className="bg-slate-800/50 rounded-xl shadow-lg p-8 mb-8 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white">Crear Partido (Admin)</h2>
            <div className="text-sm text-slate-300">Administrador: {adminCi}</div>
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAdminAuthenticated(false)
                setAdminCi('')
                setAdminPassword('')
                setAdminFailedAttempts(0)
                // clear loaded data
                setPlayers([])
                setTournaments([])
                setInscriptions([])
              }}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
        <div className="h-1 w-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mx-auto mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label className="mb-2 block text-slate-300">Torneo:</Label>
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

          <PlayerSelection
            label="Jugador 1"
            playerSearch={player1Search}
            onPlayerSearchChange={setPlayer1Search}
            player={player1}
            onPlayerChange={setPlayer1}
            filteredPlayerOptions={filteredPlayer1Options}
            matchTournament={matchTournament}
            isMatchPrepared={false}
          />

          <PlayerSelection
            label="Jugador 2"
            playerSearch={player2Search}
            onPlayerSearchChange={setPlayer2Search}
            player={player2}
            onPlayerChange={setPlayer2}
            filteredPlayerOptions={filteredPlayer2Options}
            matchTournament={matchTournament}
            isMatchPrepared={false}
          />

          <div className="md:col-span-2">
            <Label className="mb-2 block text-slate-300">Round:</Label>
            <Input
              type="text"
              value={round}
              onChange={(e) => setRound(e.target.value)}
              placeholder="Ej: Cuartos de Final, Liga, etc."
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center">
          <Button
            variant="outstanding"
            disabled={!matchTournament || !player1 || !player2 || !round || isSubmitting}
            onClick={handleCreateMatch}
            className="cursor-pointer w-1/2 gap-4 rounded-lg"
          >
            {isSubmitting ? 'Creando Partido...' : 'Crear Partido'}
          </Button>
        </div>
      </div>
    </div>
  )
}
