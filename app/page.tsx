import type { Metadata } from "next"
import HomeClient from "@/components/HomeClient"

export const metadata: Metadata = {
  title: "Inicio — LPP",
  description: "Página principal del club de Tenis de Mesa del IUJO",
}

export default function Page() {
  return <HomeClient />
}
