import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface LevelCardProps {
  level: string
  count: number
  color: "green" | "yellow" | "pink"
}

export function LevelCard({ level, count, color }: LevelCardProps) {
  const colorClasses = {
    green: "bg-green-100 border-green-200 text-green-800",
    yellow: "bg-yellow-100 border-yellow-200 text-yellow-800",
    pink: "bg-pink-100 border-pink-200 text-pink-800",
  }

  return (
    <Card className={cn("border-2", colorClasses[color])}>
      <CardContent className="p-6 text-center">
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-80">{level}</p>
          <p className="text-3xl font-bold">{count}</p>
          <p className="text-xs opacity-70">jugadores</p>
        </div>
      </CardContent>
    </Card>
  )
}
