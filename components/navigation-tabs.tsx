"use client"
import { cn } from "@/lib/utils"

interface NavigationTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "dashboard", label: "Estadísticas", icon: "📊" },
  { id: "usuarios", label: "Usuarios", icon: "👥" },
  { id: "torneos", label: "Torneos", icon: "🏆" },
  { id: "partidos", label: "Partidos", icon: "🏓" },
]

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {
  return (
    <nav className=" pl-4 pr-4 w-full overflow-x-auto scrollbar-hide border-b border-border bg-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
