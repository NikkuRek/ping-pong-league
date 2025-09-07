import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface TournamentModeCardProps {
  mode: string
  count: number
  color: "light-green" | "pink"
}

export function TournamentModeCard({ mode, count, color }: TournamentModeCardProps) {
  const colorClasses = {
    "light-green": "bg-emerald-100 border-emerald-200 text-emerald-800",
    pink: "bg-rose-100 border-rose-200 text-rose-800",
  }

  return (
    <Card className={cn("", colorClasses[color])}>
      <CardContent className="p-6 text-center">
        <div className="space-y-2">
          <p className="text-sm font-medium opacity-80">{mode}</p>
          <p className="text-3xl font-bold">{count}</p>
          <p className="text-xs opacity-70">torneos</p>
        </div>
      </CardContent>
    </Card>
  )
}
