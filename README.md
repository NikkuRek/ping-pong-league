# Plataforma de Gestión de Torneos de Ping Pong

## Descripción

Esta plataforma está diseñada para gestionar torneos de ping pong de manera eficiente y organizada. Permite registrar jugadores, visualizar tablas de posiciones, consultar partidos recientes y administrar la disponibilidad de los participantes. 

## Características

- **Registro de Jugadores**: Los usuarios pueden registrarse proporcionando información como nombre, apellido, cédula, semestre, carrera, teléfono, tier y disponibilidad.
- **Tabla de Posiciones**: Visualización dinámica de las posiciones de los jugadores, incluyendo estadísticas como partidos jugados, victorias, derrotas y puntos.
- **Últimos Encuentros**: Consulta de los últimos cinco partidos jugados, generados dinámicamente.
- **Diseño Responsivo**: Interfaz adaptada para dispositivos móviles y de escritorio.
- **Navegación Intuitiva**: Menú de navegación para acceder rápidamente a las secciones principales.

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
ping-pong-league/
├── index.html          # Página principal con tabla de posiciones y últimos encuentros
├── src/
│   ├── html/
│   │   └── register.html  # Página para el registro de jugadores
│   ├── css/
│   │   ├── global.css     # Estilos globales
│   │   └── register.css   # Estilos específicos para el registro
│   ├── js/
│   │   └── main.js        # Lógica principal de la plataforma
│   └── data/
│       ├── players.js     # Datos de jugadores
│       └── games.js       # Datos de partidos
├── assets/
│   └── img/              # Imágenes y recursos gráficos
└── readme.md             # Documentación del proyecto
```

## Tecnologías Utilizadas

- **HTML5**: Estructura de las páginas.
- **CSS3**: Estilización de la interfaz.
- **JavaScript**: Generación dinámica de contenido y lógica de la plataforma.
- **Normalize.css**: Normalización de estilos entre navegadores.

## Instalación

1. Clona este repositorio en tu máquina local:
    ```bash
    git clone https://github.com/usuario/ping-pong-league.git
    ```
2. Navega al directorio del proyecto:
    ```bash
    cd ping-pong-league
    ```
3. Abre el archivo `index.html` en tu navegador para iniciar la plataforma.

