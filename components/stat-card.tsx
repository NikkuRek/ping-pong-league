import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  className?: string
}

export function StatCard({ title, value, icon, className }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">{icon}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
