import type { Metadata } from "next"
import TournamentDetailClient from "@/components/TournamentDetailClient"
import { apiGet } from "@/lib/api"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const data = await apiGet(`/tournament/${params.id}`)
    const t = (data as any)?.data || (data as any)
    const title = t?.name ? `${t.name} — LPP` : `Torneo ${params.id} — LPP`
    const description = t?.description ? String(t.description).slice(0, 160) : `Detalle del torneo ${t?.name || params.id}`
    return { title, description }
  } catch (err) {
    return { title: `Torneo ${params.id} — LPP`, description: "Detalle del torneo" }
  }
}

export default function Page({ params }: { params: { id: string } }) {
  return <TournamentDetailClient params={params} />
}
