class HeaderPingPong extends HTMLElement {
    constructor() {
        super();
        this.render();

    }


    render(){
        this.innerHTML = /* HTML*/
        `<nav class="navbar">
            <div class="container-header">
                <div class="logo">
                    <img src="assets/img/raqueta.ico" alt="Logo" class="logo-img">
                    <h1 class="logo">Torneo de Ping Pong</h1>
                </div>
                <ul class="nav-links">
                    <li><a href="index.html" class="active">Inicio</a></li>
                    <li><a href="jugadores.html">Jugadores</a></li>
                    <li><a href="partidos.html">Partidos</a></li>
                </ul>
                <div class="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>`
    }

}

customElements.define('header-ping-pong', HeaderPingPong);