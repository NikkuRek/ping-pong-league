"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AppLogo } from "./AppLogo"
import { useAuth } from "@/context/AuthContext"
import { Button } from "./ui/button"
import { LogOut, User, ChevronDown } from "lucide-react"

const Header: React.FC = () => {
  const { isLoggedIn, player, logout, isLoading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
    router.push("/")
  }

  return (
    <header className="container mx-auto px-2 py-3">
      <div className="flex justify-between items-center">
        {/* Logo + Title */}
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <AppLogo />
          <div>
            <h1 className="text-xl font-bold text-white">LPP</h1>
            <p className="text-sm text-slate-400">Liga de Ping Pong</p>
          </div>
        </Link>

        {/* Auth area */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            // Skeleton while restoring session
            <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
          ) : isLoggedIn && player ? (
            // Logged-in: avatar + name with dropdown
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(o => !o)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-700/60 transition-colors"
              >
                {player.avatar ? (
                  <Image
                    src={player.avatar}
                    alt={player.first_name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-xs font-bold">
                    {player.first_name[0]}{player.last_name?.[0] ?? ""}
                  </div>
                )}
                <span className="text-sm font-medium text-white hidden sm:block">
                  {player.first_name}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#2A2A3E] border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-700">
                    <p className="text-xs text-slate-400">Conectado como</p>
                    <p className="text-sm font-semibold text-white truncate">
                      {player.first_name} {player.last_name}
                    </p>
                    {player.aura !== undefined && (
                      <p className="text-xs text-purple-400 mt-0.5">⚡ {player.aura} Aura</p>
                    )}
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not logged in
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="text-purple-400 cursor-pointer">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/player-registration">
                <Button variant="outstanding" className="cursor-pointer hidden sm:flex">
                  Registrarse
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
