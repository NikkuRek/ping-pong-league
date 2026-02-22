"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/AuthContext"
import { AppLogo } from "@/components/AppLogo"

export default function LoginPage() {
  const [player_ci, setPlayerCi] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (failedAttempts >= 3) {
      toast({
        title: "Cuenta bloqueada",
        description: "Demasiados intentos fallidos. Por favor, contacta a un administrador.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    const result = await login(player_ci.trim(), password)

    if (result.ok) {
      setFailedAttempts(0)
      toast({
        title: "¡Bienvenido!",
        description: "Sesión iniciada correctamente.",
      })
      router.push("/profile")
    } else {
      const attempts = failedAttempts + 1
      setFailedAttempts(attempts)

      let errorMessage = result.message || "Credenciales inválidas."
      if (attempts < 3) errorMessage += ` Te quedan ${3 - attempts} intento(s).`
      if (attempts >= 3) errorMessage = "Demasiados intentos fallidos. Contacta a un administrador."

      toast({
        title: "Error de autenticación",
        description: errorMessage,
        variant: "destructive",
      })
    }

    setLoading(false)
  }

  const isFormDisabled = loading || failedAttempts >= 3

  return (
    <div className="flex items-center justify-center min-h-[calc(90vh-64px)]">
      <Card className="w-full max-w-md bg-[#2A2A3E] border-slate-700">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center">
            <AppLogo />
          </div>
          <h1 className="text-2xl text-purple-400 font-bold">Iniciar Sesión</h1>
          <p className="text-slate-400 text-sm">Ingresa tus credenciales para acceder.</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-slate-200">
              <Label htmlFor="player_ci">Cédula de Identidad</Label>
              <Input
                id="player_ci"
                type="text"
                placeholder="Ej: 29944901"
                required
                value={player_ci}
                onChange={(e) => setPlayerCi(e.target.value)}
                disabled={isFormDisabled}
                className="bg-slate-800 border-slate-600 text-white focus:border-purple-500"
              />
            </div>
            <div className="space-y-2 text-slate-200">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isFormDisabled}
                className="bg-slate-800 border-slate-600 text-white focus:border-purple-500"
              />
            </div>
            {failedAttempts >= 3 && (
              <p className="text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded p-2">
                Cuenta bloqueada por demasiados intentos. Contacta a un administrador.
              </p>
            )}
            <Button
              type="submit"
              className="w-full mt-2"
              variant="outstanding"
              disabled={isFormDisabled}
            >
              {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-2 pb-5">
          <p className="text-sm text-slate-400">
            ¿No tienes una cuenta?{" "}
            <Link href="/player-registration" className="underline text-purple-400 hover:text-slate-50">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
