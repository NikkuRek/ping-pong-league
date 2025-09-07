import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface UserCardProps {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    career: string
    semester: string
    level: "Principiante" | "Intermedio" | "Avanzado"
  }
}

export function UserCard({ user }: UserCardProps) {
  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case "Principiante":
        return "bg-green-100 text-green-800 border-green-200"
      case "Intermedio":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Avanzado":
        return "bg-pink-100 text-pink-800 border-pink-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-primary via-accent to-primary/80 p-8 text-primary-foreground">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24 border-4 border-primary-foreground/20">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground text-2xl">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-primary-foreground/80">{user.email}</p>
              <p className="text-sm text-primary-foreground/70">ID: {user.id}</p>

              <div className="space-y-1">
                <p className="font-medium">{user.career}</p>
                <p className="text-sm text-primary-foreground/80">{user.semester}</p>
              </div>

              <div className="pt-2">
                <Badge className={`border ${getLevelBadgeColor(user.level)} bg-opacity-90`}>{user.level}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
