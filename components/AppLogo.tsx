import type React from "react"

export const AppLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-lg">L</span>
      </div>
      <span className="text-xl font-bold text-white">LPP</span>
    </div>
  )
}
