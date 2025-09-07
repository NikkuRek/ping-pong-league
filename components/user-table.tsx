"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  career: string
  semester: string
  level: "Principiante" | "Intermedio" | "Avanzado"
  registrationDate: string
}

interface UserTableProps {
  users: User[]
  onEditUser: (userId: string) => void
}

export function UserTable({ users, onEditUser }: UserTableProps) {
  const getLevelBadgeColor = (level: User["level"]) => {
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">USUARIO</TableHead>
            <TableHead className="font-semibold">INFORMACIÓN ACADÉMICA</TableHead>
            <TableHead className="font-semibold">NIVEL</TableHead>
            <TableHead className="font-semibold">REGISTRO</TableHead>
            <TableHead className="font-semibold">ACCIONES</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-foreground">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">ID: {user.id}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-foreground">{user.career}</div>
                  <div className="text-sm text-muted-foreground">{user.semester}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={`border ${getLevelBadgeColor(user.level)}`}>{user.level}</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{user.registrationDate}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onEditUser(user.id)} className="h-8 w-8 p-0">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
