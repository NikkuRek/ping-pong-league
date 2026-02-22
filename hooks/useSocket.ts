"use client"

import { useEffect, useRef, useCallback } from "react"
import { io, type Socket } from "socket.io-client"

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"

/** Singleton socket – re-created if token changes (full reconnect) */
let socketInstance: Socket | null = null
let currentToken: string | null = null

export function getSocket(token: string): Socket {
  // If token changed, disconnect old socket first
  if (socketInstance && currentToken !== token) {
    socketInstance.disconnect()
    socketInstance = null
  }

  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
    })
    currentToken = token
  }
  return socketInstance
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
    currentToken = null
  }
}

interface UseSocketOptions {
  /** JWT token OR player CI (fallback for compatibility) */
  playerCI: string | null
  token?: string | null
  onMatchFinalized?: (data: { matchId: number }) => void
  onMatchRejected?: (data: { matchId: number; reason: string }) => void
  onError?: (data: { message: string }) => void
}

export function useSocket({ playerCI, token, onMatchFinalized, onMatchRejected, onError }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null)

  // Use JWT token if provided, otherwise fall back to CI (for backward compat)
  const authToken = token || playerCI

  useEffect(() => {
    if (!authToken) return

    const socket = getSocket(authToken)
    socketRef.current = socket

    if (onMatchFinalized) socket.on("matchFinalized", onMatchFinalized)
    if (onMatchRejected) socket.on("matchRejected", onMatchRejected)
    if (onError) socket.on("error", onError)

    return () => {
      if (onMatchFinalized) socket.off("matchFinalized", onMatchFinalized)
      if (onMatchRejected) socket.off("matchRejected", onMatchRejected)
      if (onError) socket.off("error", onError)
    }
  }, [authToken, onMatchFinalized, onMatchRejected, onError])

  const approveResult = useCallback((matchId: number) => {
    socketRef.current?.emit("approveResult", { matchId })
  }, [])

  const rejectResult = useCallback((matchId: number, reason: string) => {
    socketRef.current?.emit("rejectResult", { matchId, reason })
  }, [])

  return { approveResult, rejectResult, socket: socketRef.current }
}
