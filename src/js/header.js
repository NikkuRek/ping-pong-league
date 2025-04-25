const headerHTML = `
    <header>
        <nav class="navbar">
            <div class="container-header">
                <div class="logo">
                    <img src="../../assets/img/raqueta.ico" alt="Logo" class="logo-img">
                    <h1 class="logo">Torneo de Ping Pong</h1>
                </div>
                <ul class="nav-links">
                    <li><a href="index.html" class="active">Inicio</a></li>
                    <li><a href="jugadores.html">Jugadores</a></li>
                    <li><a href="partidos.html">Partidos</a></li>
                </ul>
            </div>
        </nav>
    </header>
`;

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    if (body) {
        body.insertAdjacentHTML('afterbegin', headerHTML);
    } else {
        console.error("Error: El elemento body no fue encontrado.");
    }
});