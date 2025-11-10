import type { Metadata } from "next"
import PlayerRegistrationClient from "@/components/PlayerRegistrationClient"

export const metadata: Metadata = {
  title: "Registro de Jugadores — LPP",
  description: "Formulario para registrar nuevos jugadores al club",
}

export default function Page() {
  return <PlayerRegistrationClient />
}
