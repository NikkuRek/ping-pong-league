"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HomeIcon, TrophyIcon, UsersIcon, PlusIcon } from "@/components/icons"
import { User } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const BottomNav = () => {
  const pathname = usePathname()
  const { isLoggedIn } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const navItems = [
    { href: "/", label: "Inicio", icon: HomeIcon },
    { href: "/tournaments", label: "Torneos", icon: TrophyIcon },
    { href: "/players", label: "Jugadores", icon: UsersIcon },
    { href: "/matches/create", label: "Partido", icon: PlusIcon },
    {
      href: isMounted && isLoggedIn ? "/profile" : "/login",
      label: isMounted && isLoggedIn ? "Perfil" : "Sesión",
      icon: User,
    },
  ]

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
                isActive ? "text-purple-500" : "text-gray-400 hover:text-white"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
