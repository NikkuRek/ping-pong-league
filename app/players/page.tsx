import type { Metadata } from "next"
import PlayersClient from "@/components/PlayersClient"

export const metadata: Metadata = {
  title: "Jugadores — LPP",
  description: "Listado de jugadores registrados en el club",
}

export default function Page() {
  return <PlayersClient />
}
