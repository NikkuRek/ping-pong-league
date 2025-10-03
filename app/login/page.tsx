"use client" // Add this for client-side hooks

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation" // Import useRouter
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast" // Import useToast
import { getApiUrl } from "@/lib/api-config"

export default function LoginPage() {
  const [player_ci, setPlayerCi] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false) // Add loading state
  const [failedAttempts, setFailedAttempts] = useState(0) // Track failed attempts
  const router = useRouter() // Initialize useRouter
  const { toast } = useToast() // Initialize useToast

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

    setLoading(true) // Set loading to true

    try {
      const apiUrl = getApiUrl()

      const response = await fetch(`${apiUrl}/credential/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ player_ci, password }),
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Autenticación exitosa:", data)
        setFailedAttempts(0) // Reset failed attempts on success
        toast({
          title: "Autenticación exitosa",
          description: "Bienvenido. Redirigiendo a la pantalla de inicio...",
          variant: "default",
        })
        // TODO: Save token or session information here if needed
        router.push("/") // Redirect to home page
      } else {
        setFailedAttempts((prev) => prev + 1) // Increment failed attempts
        let errorMessage = data.message || "Credenciales inválidas. Inténtalo de nuevo."

        if (failedAttempts + 1 >= 3) {
          // Check if this attempt makes it 3 or more
          errorMessage = "Demasiados intentos fallidos. Por favor, contacta a un administrador."
        } else {
          errorMessage += ` Te quedan ${3 - (failedAttempts + 1)} intentos.`
        }

        toast({
          title: "Error de autenticación",
          description: errorMessage,
          variant: "destructive",
        })
        console.error("Error en la autenticación:", data)
      }
    } catch (err) {
      toast({
        title: "Error de red",
        description: "No se pudo conectar con el servidor. Verifica tu conexión.",
        variant: "destructive",
      })
      console.error("Error de red:", err)
    } finally {
      setLoading(false) // Set loading to false
    }
  }

  const isFormDisabled = loading || failedAttempts >= 3

  return (
    <div className="flex items-center justify-center min-h-[calc(90vh-64px)]">
      {" "}
      {/* Adjust min-h to account for header height */}
      <Card className="w-full max-w-md bg-[#2A2A3E]">
        <CardHeader className="text-center">
          <h1 className="text-2xl text-slate-200 font-bold">Iniciar Sesión</h1>
          <p className="text-slate-400 text-sm">Ingresa tus credenciales para acceder a tu cuenta.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="space-y-2 text-slate-200">
              <Label htmlFor="player_ci">Cédula</Label>
              <Input
                id="player_ci"
                type="text"
                required
                value={player_ci}
                onChange={(e) => setPlayerCi(e.target.value)}
                disabled={isFormDisabled}
              />
            </div>
            <div className="space-y-2 text-slate-200 mt-4">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isFormDisabled}
              />
            </div>
            <Button
              type="submit"
              className="cursor-pointer w-full gap-4 rounded-lg flex items-center justify-center mt-6"
              variant="outstanding"
              disabled={isFormDisabled}
            >
              {loading ? "Iniciando Sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {" "}
          {/* Moved CardFooter outside form */}
          <p className="text-sm text-slate-400">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="underline text-slate-200 hover:text-slate-50">
              Regístrate
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
