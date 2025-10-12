"use client"

import * as React from "react"

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
}

export function Tooltip({ children, content, className = "" }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-50 px-3 py-2 text-sm bg-slate-800 text-white rounded-lg shadow-lg border border-slate-700 whitespace-nowrap bottom-full right-0 mb-2 ${className}`}>
          {content}
          <div className="absolute top-full right-4 -mt-1">
            <div className="border-4 border-transparent border-t-slate-800"></div>
          </div>
        </div>
      )}
    </div>
  )
}
