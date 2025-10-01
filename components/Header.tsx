"use client"

import type React from "react"
// import { Button } from "../components/ui/button"
// import Link from "next/link"
import { AppLogo } from "./AppLogo";

const Header: React.FC = () => {
  return (
    <header className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <AppLogo />
          <div>
            <h1 className="text-xl font-bold text-white">LPP</h1>
            <p className="text-sm text-slate-400">Gestión de Torneos</p>
          </div>
        </div>
        {/* <div className="gap-4 rounded-lg flex items-center justify-center">
          <Link href="/login">
            <Button className="cursor-pointer" variant="outstanding" >Iniciar Sesión</Button>
          </Link>
        </div> */}
      </div>
    </header>
  )
}

export default Header
