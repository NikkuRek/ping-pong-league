import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
// @ts-ignore TS cannot find type declarations for side-effect CSS import
import "./globals.css"
import Header from "@/components/Header"
import BottomNav from "@/components/BottomNav"

export const metadata: Metadata = {
  title: "LPP - IUJO",
  description: "Página del Club de Tenis de Mesa del IUJO, Barquisimeto",
  icons: [
    { rel: "icon", url: "/favicon-purp.ico" },
  ],
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`bg-[#1C1C2E] font-sans text-white selection:bg-purple-500/30 flex flex-col min-h-screen ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
          <main className="container mx-auto px-4 flex-grow">{children}</main>
          <BottomNav />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
