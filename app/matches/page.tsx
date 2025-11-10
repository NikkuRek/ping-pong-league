import type { Metadata } from "next"
import MatchesClient from "@/components/MatchesClient"

export const metadata: Metadata = {
  title: "Partidos — LPP",
  description: "Historial y creación de partidos del club",
}

export default function Page() {
  return <MatchesClient />
}
