"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserTable } from "@/components/user-table"
import { useRouter } from "next/navigation"

// Mock data for demonstration
const mockUsers = [
  {
    id: "USR001",
    name: "Ana García López",
    email: "ana.garcia@universidad.edu",
    avatar: "/woman-profile.png",
    career: "Ingeniería de Sistemas",
    semester: "7mo Semestre",
    level: "Avanzado" as const,
    registrationDate: "15/03/2024",
  },
  {
    id: "USR002",
    name: "Carlos Rodríguez",
    email: "carlos.rodriguez@universidad.edu",
    avatar: "/man-profile.png",
    career: "Administración de Empresas",
    semester: "5to Semestre",
    level: "Intermedio" as const,
    registrationDate: "22/02/2024",
  },
  {
    id: "USR003",
    name: "María Fernández",
    email: "maria.fernandez@universidad.edu",
    avatar: "/woman-student.png",
    career: "Psicología",
    semester: "3er Semestre",
    level: "Principiante" as const,
    registrationDate: "08/04/2024",
  },
  {
    id: "USR004",
    name: "Diego Martínez",
    email: "diego.martinez@universidad.edu",
    avatar: "/man-student.png",
    career: "Ingeniería Industrial",
    semester: "6to Semestre",
    level: "Intermedio" as const,
    registrationDate: "12/01/2024",
  },
  {
    id: "USR005",
    name: "Sofía Herrera",
    email: "sofia.herrera@universidad.edu",
    avatar: "/woman-young.jpg",
    career: "Medicina",
    semester: "8vo Semestre",
    level: "Avanzado" as const,
    registrationDate: "30/03/2024",
  },
  {
    id: "USR006",
    name: "Andrés Morales",
    email: "andres.morales@universidad.edu",
    avatar: "/man-young.jpg",
    career: "Derecho",
    semester: "2do Semestre",
    level: "Principiante" as const,
    registrationDate: "18/04/2024",
  },
]

export function UsersView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [users] = useState(mockUsers)
  const router = useRouter()

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.career.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEditUser = (userId: string) => {
    router.push(`/usuarios/${userId}`)
  }

  const handleAddUser = () => {
    console.log("Add new user")
    // TODO: Implement add user functionality
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">Administra los jugadores registrados en el sistema</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-sm">
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={handleAddUser} className="bg-primary hover:bg-primary/90">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir Nuevo Usuario
        </Button>
      </div>

      {/* Users Table */}
      <UserTable users={filteredUsers} onEditUser={handleEditUser} />

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Mostrando {filteredUsers.length} de {users.length} usuarios
        </div>
        {searchTerm && <div>Filtrado por: "{searchTerm}"</div>}
      </div>
    </div>
  )
}
