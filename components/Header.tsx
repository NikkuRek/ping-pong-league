"use client"

import type React from "react"
import { BellIcon, MenuIcon } from "./icons"

const AppLogo: React.FC<{ size?: string }> = ({ size = "w-10 h-10" }) => (
  <div
    className={`flex-shrink-0 ${size} bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center`}
  >
    <div className="w-1/2 h-1/2 bg-white rounded-full flex items-center justify-center">
      <div className="w-1/3 h-1/3 bg-purple-600 rounded-sm transform rotate-45"></div>
    </div>
  </div>
)

interface HeaderProps {
  isAdminView: boolean
  onToggleView: () => void
}

const Header: React.FC<HeaderProps> = ({ isAdminView, onToggleView }) => {
  return (
    <header className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        {isAdminView ? (
          <>
            <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
            <button
              onClick={onToggleView}
              className="bg-red-500/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              User View
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <AppLogo />
              <div>
                <h1 className="text-xl font-bold text-white">TorneoTT</h1>
                <p className="text-sm text-slate-400">Gestión de Torneos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onToggleView}
                className="hidden md:block bg-red-500/80 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Admin
              </button>
              <div className="relative">
                <BellIcon className="w-6 h-6 text-slate-300" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#1C1C2E]"></span>
              </div>
              <button className="p-2 rounded-lg bg-[#2A2A3E]">
                <MenuIcon className="w-6 h-6 text-slate-300" />
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
