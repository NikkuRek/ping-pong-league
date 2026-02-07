"use client"
import type React from "react"
import { AppLogo } from "./AppLogo"
import { useWelcomeData } from "@/hooks/useWelcomeData"
import Link from "next/link"
import { Button } from "./ui/button"

const Welcome: React.FC = () => {
  const { playerCount, activeTournamentsCount, loading, error } = useWelcomeData()

  return (
    <div className="text-center flex flex-col items-center space-y-8 animate-fade-in">
      <AppLogo />
      <div className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Bienvenido a la Liga de Ping Pong (LPP)
        </h1>
        <p className="text-slate-400 text-lg">Compite y gana en partidos oficiales del club de Tenis de Mesa del IUJO</p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        <div className="bg-[#2A2A3E] p-4 rounded-xl text-center border border-slate-700">
          <p className="text-slate-400">Jugadores</p>
          {loading ? (
            <p className="text-3xl font-bold text-purple-400">...</p>
          ) : (
            <p className="text-3xl font-bold text-purple-400">{playerCount}</p>
          )}
        </div>
        <div className="bg-[#2A2A3E] p-4 rounded-xl text-center border border-slate-700">
          <p className="text-slate-400">Torneos Activos</p>
          {loading ? (
            <p className="text-3xl font-bold text-purple-400">...</p>
          ) : (
            <p className="text-3xl font-bold text-purple-400">{activeTournamentsCount - 2}</p>
          )}
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">Error al cargar los datos.</p>}
      <div className="animate-slide-in-from-bottom">
      <div className="animate-slide-in-from-bottom w-full max-w-2xl px-4 mb-8">
        <div className="bg-gradient-to-r from-purple-900/40 to-slate-900/40 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
           <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
            ¡Nuevo inicio de semestre!
          </h3>
          <p className="text-slate-300 mb-6">
            Renueva tus datos para participar o regístrate si eres nuevo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/player-registration" className="w-full sm:w-auto">
              <Button
                className="w-full sm:w-auto text-lg py-6 px-8 font-bold shadow-lg shadow-purple-900/20"
                size="lg"
                variant="outstanding"
              >
                ¡Únete Ahora!
              </Button>
            </Link>
            <Link href="/renew-data" className="w-full sm:w-auto">
               <Button
                className="w-full sm:w-auto text-lg py-6 px-8 font-bold border-purple-500 text-purple-100 hover:bg-purple-900/30"
                size="lg"
                variant="outline"
              >
                Renovar Datos
              </Button>
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Welcome
