"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Skeleton } from "./ui/skeleton"
import { Button } from "./ui/button"
import { Settings, UserPen, ImagePlus, Award, LogOut, ExternalLink, X } from "lucide-react"
import PlayerProfile from "./PlayerProfile"
import ProfileTabs from "./ProfileTabs"

// ── Gear menu (referential – to be implemented later) ──────────────
const GEAR_OPTIONS = [
  { icon: UserPen,   label: "Editar Perfil",    id: "edit-profile" },
  { icon: ImagePlus, label: "Editar Avatar",     id: "edit-avatar" },
  { icon: Award,     label: "Editar Insignias",  id: "edit-badges" },
]

function GearMenu({ ci }: { ci: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className="absolute bottom-4 right-4 z-20">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200
          ${open
            ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
            : "bg-slate-700/60 text-slate-400 hover:bg-slate-700 hover:text-white"
          }`}
        title="Opciones de perfil"
        aria-label="Opciones de perfil"
      >
        <Settings className={`w-4.5 h-4.5 transition-transform duration-300 ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="absolute bottom-11 left-0 w-52 bg-[#1E1E30] border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-slate-700/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mi Perfil</span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-white transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Options */}
          <ul className="py-1.5">
            {GEAR_OPTIONS.map(({ icon: Icon, label, id }) => (
              <li key={id}>
                <button
                  disabled
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400
                    hover:bg-slate-700/40 hover:text-white transition-colors cursor-not-allowed opacity-60"
                  title="Próximamente"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                  <span className="ml-auto text-[10px] bg-slate-700 text-slate-500 px-1.5 py-0.5 rounded-full">
                    Pronto
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* View public profile */}
          <div className="px-3 pb-2.5 pt-1 border-t border-slate-700/60">
            <Link
              href={`/players/detail?ci=${ci}`}
              className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 py-1 transition-colors"
              onClick={() => setOpen(false)}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver perfil público
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────
const MyProfile: React.FC = () => {
  const { player, isLoggedIn, isLoading, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  // Loading
  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="bg-[#2A2A3E] p-5 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Not logged in
  if (!isLoggedIn || !player) {
    return (
      <section className="bg-[#2A2A3E] p-8 rounded-2xl border border-slate-700/50 text-center space-y-4">
        <div className="text-5xl mb-2">🏓</div>
        <h3 className="text-xl font-bold text-white">Inicia sesión para ver tu perfil</h3>
        <p className="text-slate-400 text-sm">Accede a tus estadísticas, partidos y configuración.</p>
        <Link href="/login">
          <Button variant="outstanding" className="mt-2">Iniciar Sesión</Button>
        </Link>
      </section>
    )
  }

  return <LoggedInProfile ci={player.ci} onLogout={handleLogout} />
}

// ── Sub-component for logged-in view ───────────────────────────────
// Uses the same data hooks as PlayerDetailClient so the layout
// mirrors the public profile perfectly.
function LoggedInProfile({ ci, onLogout }: { ci: string; onLogout: () => void }) {
  return (
    <div className="space-y-6">
      {/* Player Profile & Gear */}
      <div className="relative">
        <PlayerProfile ci={ci} />
        <GearMenu ci={ci} />
      </div>

      {/* Unified Tabs: History, Stats, Consensus */}
      <ProfileTabs playerId={ci} isOwnProfile={true} />

      {/* Logout button at the bottom
      <div className="flex justify-end">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400
            transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div> */}
    </div>
  )
}

export default MyProfile
