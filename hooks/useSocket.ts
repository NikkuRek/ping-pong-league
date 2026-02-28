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
  onMatchFinalized?: (data: { matchId: number; approvedBy?: string }) => void
  onMatchRejected?: (data: { matchId: number; reason: string; rejectedBy?: string }) => void
  onMatchReproposed?: (data: { matchId: number; reproposedBy?: string }) => void
  onError?: (data: { message: string }) => void
}

export function useSocket({ playerCI, token, onMatchFinalized, onMatchRejected, onMatchReproposed, onError }: UseSocketOptions) {
  const socketRef = useRef<Socket | null>(null)

  // Use JWT token if provided, otherwise fall back to CI (for backward compat)
  const authToken = token || playerCI

  useEffect(() => {
    if (!authToken) return

    const socket = getSocket(authToken)
    socketRef.current = socket

    console.log(`[SOCKET_DEBUG - Client] Connecting with token/CI:`, authToken)

    socket.on('connect', () => console.log(`[SOCKET_DEBUG - Client] Connected: ${socket.id}`))
    socket.on('disconnect', () => console.log(`[SOCKET_DEBUG - Client] Disconnected`))

    const wrappedOnMatchFinalized = (data: any) => {
        console.log(`[SOCKET_DEBUG - Client] Received 'matchFinalized'`, data)
        if (onMatchFinalized) onMatchFinalized(data)
    }

    const wrappedOnMatchRejected = (data: any) => {
        console.log(`[SOCKET_DEBUG - Client] Received 'matchRejected'`, data)
        if (onMatchRejected) onMatchRejected(data)
    }

    const wrappedOnMatchReproposed = (data: any) => {
        console.log(`[SOCKET_DEBUG - Client] Received 'matchReproposed'`, data)
        if (onMatchReproposed) onMatchReproposed(data)
    }

    if (onMatchFinalized) socket.on("matchFinalized", wrappedOnMatchFinalized)
    if (onMatchRejected) socket.on("matchRejected", wrappedOnMatchRejected)
    if (onMatchReproposed) socket.on("matchReproposed", wrappedOnMatchReproposed)
    if (onError) socket.on("error", onError)

    return () => {
      if (onMatchFinalized) socket.off("matchFinalized", wrappedOnMatchFinalized)
      if (onMatchRejected) socket.off("matchRejected", wrappedOnMatchRejected)
      if (onMatchReproposed) socket.off("matchReproposed", wrappedOnMatchReproposed)
      if (onError) socket.off("error", onError)
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [authToken, onMatchFinalized, onMatchRejected, onMatchReproposed, onError])

  const approveResult = useCallback((matchId: number) => {
    console.log(`[SOCKET_DEBUG - Client] Emitting 'approveResult' for matchId: ${matchId}`)
    socketRef.current?.emit("approveResult", { matchId })
  }, [])

  const rejectResult = useCallback((matchId: number, reason: string) => {
    console.log(`[SOCKET_DEBUG - Client] Emitting 'rejectResult' for matchId: ${matchId}, reason: ${reason}`)
    socketRef.current?.emit("rejectResult", { matchId, reason })
  }, [])

  const reproposeResult = useCallback((matchId: number) => {
    console.log(`[SOCKET_DEBUG - Client] Emitting 'reproposeResult' for matchId: ${matchId}`)
    socketRef.current?.emit("reproposeResult", { matchId })
  }, [])

  return { approveResult, rejectResult, reproposeResult, socket: socketRef.current }
}
