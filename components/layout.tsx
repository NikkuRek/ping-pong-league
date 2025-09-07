"use client"

import type React from "react"

import { NavigationTabs } from "./navigation-tabs"

interface LayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">🏓</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Sistema de Gestión de Torneos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-muted-foreground text-sm">👤</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="m-2 bg-primary-foreground pt-5 border border-border rounded-lg shadow-sm">

      <NavigationTabs activeTab={activeTab} onTabChange={onTabChange} />

      <main className="container mx-auto px-6 py-8">{children}</main>
      </div>
    </div>
  )
}
