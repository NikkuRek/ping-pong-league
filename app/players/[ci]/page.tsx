import type { Metadata } from "next"
import PlayerDetailClient from "@/components/PlayerDetailClient"
import { apiGet } from "@/lib/api"

export async function generateMetadata({ params }: { params: { ci: string } }): Promise<Metadata> {
  try {
  const data = await apiGet(`/player/${params.ci}`)
  const p = (data as any)?.data || (data as any)
    const name = p?.first_name && p?.last_name ? `${p.first_name} ${p.last_name}` : `Jugador ${params.ci}`
    return {
      title: `${name} — LPP`,
      description: `Perfil, partidos y estadísticas de ${name}`,
    }
  } catch (err) {
    return { title: `Jugador ${params.ci} — LPP`, description: "Perfil del jugador" }
  }
}

export default function Page({ params }: { params: { ci: string } }) {
  return <PlayerDetailClient params={params} />
}
