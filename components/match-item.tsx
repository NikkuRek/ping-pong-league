import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface MatchItemProps {
  opponent: string
  result: "Victoria" | "Derrota"
  score: string
  date: string
}

export function MatchItem({ opponent, result, score, date }: MatchItemProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-foreground">vs {opponent}</p>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>
          <div className="text-right space-y-1">
            <Badge
              className={
                result === "Victoria"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-800 border-red-200"
              }
            >
              {result}
            </Badge>
            <p className="text-sm font-mono text-muted-foreground">{score}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
