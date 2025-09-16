"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, TrophyIcon, UsersIcon, SettingsIcon } from "@/components/icons"

const navItems = [
  { href: "/", label: "Inicio", icon: HomeIcon },
  { href: "/tournaments", label: "Torneos", icon: TrophyIcon },
  { href: "/players", label: "Jugadores", icon: UsersIcon },
  { href: "/profile", label: "Perfil", icon: UsersIcon },
  { href: "/settings", label: "Ajustes", icon: SettingsIcon },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1C1C2E] border-t border-gray-700/50 shadow-lg z-50">
      <div className="flex justify-around max-w-screen-sm mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              href={href}
              key={label}
              className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-sm transition-colors duration-200 ${
                isActive ? "text-purple-400" : "text-gray-400 hover:text-white"
              }`}>
              <Icon className="w-6 h-6 mb-1" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
