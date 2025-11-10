"use client"

import type React from "react"

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, className = "" }) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <p className="text-red-400 mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
          Reintentar
        </button>
      )}
    </div>
  )
}
