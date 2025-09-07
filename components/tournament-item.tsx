import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TournamentItemProps {
  name: string
  status: "Próximo" | "En Curso" | "Finalizado"
  date?: string
}

export function TournamentItem({ name, status, date }: TournamentItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Próximo":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "En Curso":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Finalizado":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="font-medium text-foreground">{name}</p>
            {date && <p className="text-sm text-muted-foreground">{date}</p>}
          </div>
          <Badge className={getStatusColor(status)}>{status}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
