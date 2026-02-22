"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getApiUrl } from "@/lib/api-config"

export interface AuthPlayer {
  ci: string
  first_name: string
  last_name: string
  avatar?: string | null
  aura?: number | string
  career_id?: number
}

interface AuthState {
  player: AuthPlayer | null
  token: string | null
  isLoggedIn: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (ci: string, password: string) => Promise<{ ok: boolean; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const STORAGE_TOKEN_KEY = "lpp_token"
const STORAGE_PLAYER_KEY = "lpp_player"

/** Decode a JWT payload without a library */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    player: null,
    token: null,
    isLoggedIn: false,
    isLoading: true,
  })

  // Restore session from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const storedToken = localStorage.getItem(STORAGE_TOKEN_KEY)
      const storedPlayer = localStorage.getItem(STORAGE_PLAYER_KEY)
      if (storedToken && storedPlayer) {
        const player: AuthPlayer = JSON.parse(storedPlayer)
        setState({ player, token: storedToken, isLoggedIn: true, isLoading: false })
        // Also sync legacy key used by useSocket / MatchConsensusPanel
        localStorage.setItem("playerCI", player.ci)
        return
      }
    } catch { /* ignore */ }
    setState(s => ({ ...s, isLoading: false }))
  }, [])

  const login = useCallback(async (ci: string, password: string) => {
    try {
      const apiUrl = getApiUrl()
      const res = await fetch(`${apiUrl}/credential/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // necesario para que el backend pueda setear la cookie HttpOnly
        body: JSON.stringify({ player_ci: ci, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { ok: false, message: data.message || "Credenciales inválidas" }
      }

      // Backend responde: { message, token, user: {...player} }
      const token: string = data.token || ""
      if (!token) return { ok: false, message: "El servidor no devolvió un token" }

      // Decode JWT to get player info
      const payload = decodeJwtPayload(token)

      // Build player from data.user (preferred) or JWT payload
      const rawUser = data.user ?? null
      let player: AuthPlayer = {
        ci,
        first_name: rawUser?.first_name || (payload?.first_name as string) || (payload?.name as string) || ci,
        last_name: rawUser?.last_name || (payload?.last_name as string) || "",
        avatar: rawUser?.avatar || (payload?.avatar as string) || null,
        aura: rawUser?.aura ?? (payload?.aura as number) ?? undefined,
        career_id: rawUser?.career_id ?? (payload?.career_id as number) ?? undefined,
      }

      try {
        const playerRes = await fetch(`${apiUrl}/player/${ci}`)
        if (playerRes.ok) {
          const playerData = await playerRes.json()
          const p = playerData.data ?? playerData.player ?? null
          if (p) {
            player = {
              ci: p.ci,
              first_name: p.first_name,
              last_name: p.last_name,
              avatar: p.avatar,
              aura: p.aura,
              career_id: p.career_id,
            }
          }
        }
      } catch { /* fall back to JWT payload */ }

      // Persist
      localStorage.setItem(STORAGE_TOKEN_KEY, token)
      localStorage.setItem(STORAGE_PLAYER_KEY, JSON.stringify(player))
      localStorage.setItem("playerCI", ci) // legacy key for socket / consensus panel

      setState({ player, token, isLoggedIn: true, isLoading: false })
      return { ok: true }
    } catch {
      return { ok: false, message: "No se pudo conectar con el servidor" }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN_KEY)
    localStorage.removeItem(STORAGE_PLAYER_KEY)
    localStorage.removeItem("playerCI")
    setState({ player: null, token: null, isLoggedIn: false, isLoading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
