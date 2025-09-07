# Plataforma de Gestión de Torneos de Ping Pong

## Descripción

Aplicación web para la gestión eficiente de torneos de ping pong. Permite registrar jugadores, visualizar estadísticas, consultar partidos recientes y administrar la disponibilidad de los participantes, todo en una interfaz moderna y responsiva.

## Características

- **Registro y gestión de jugadores**: Alta de usuarios con datos personales y académicos.
- **Tabla de posiciones**: Estadísticas en tiempo real de partidos, victorias, derrotas y puntos.
- **Historial de partidos**: Consulta de encuentros recientes y detalles de torneos.
- **Diseño responsivo**: Adaptado para dispositivos móviles y escritorio.
- **Navegación intuitiva**: Menús y vistas organizadas por secciones.

## Estructura del Proyecto

```
ping-pong-league/
├── app/                # Estructura principal de páginas y layouts (Next.js)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── usuarios/
│       └── [id]/page.tsx
├── components/         # Componentes reutilizables y vistas
│   ├── layout.tsx
│   ├── user-card.tsx
│   ├── ui/             # Componentes UI (botones, formularios, tablas, etc.)
│   └── views/          # Vistas principales (dashboard, usuarios, torneos, partidos)
├── hooks/              # Custom hooks (use-mobile, use-toast)
├── lib/                # Funciones utilitarias
├── public/             # Imágenes y recursos estáticos
├── styles/             # Estilos globales (Tailwind CSS)
│   └── globals.css
├── package.json        # Dependencias y scripts
└── README.md           # Documentación
```

## Tecnologías Utilizadas

- **Next.js**: Framework React para aplicaciones web modernas.
- **React**: Librería principal para la UI.
- **Tailwind CSS**: Estilización rápida y responsiva.
- **Radix UI**: Componentes accesibles y personalizables.
- **TypeScript**: Tipado estático para mayor robustez.
- **Zod**: Validación de esquemas.
- **date-fns**: Manipulación de fechas.
- **Normalize.css**: Consistencia de estilos entre navegadores.

## Instalación y Ejecución

1. Clona el repositorio:
    ```bash
    git clone https://github.com/usuario/ping-pong-league.git
    ```
2. Instala las dependencias:
    ```bash
    npm install
    ```
3. Inicia el entorno de desarrollo:
    ```bash
    npm run dev
    ```
4. Accede a la aplicación en [http://localhost:3000](http://localhost:3000)

## Scripts Disponibles

- `dev`: Ejecuta el servidor de desarrollo.
- `build`: Compila la aplicación para producción.
- `start`: Inicia la aplicación en modo producción.
- `lint`: Ejecuta el linter.

## Créditos

Desarrollado por el equipo de gestión de torneos de ping pong.


