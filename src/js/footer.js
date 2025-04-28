
const footerHTML = `
    <footer>
        <div class="container">
            <p>&copy; 2025 Torneo de Tenis de Mesa. Todos los derechos reservados.</p>
        </div>
    </footer>
`;

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    if (body) {
        body.insertAdjacentHTML('beforeend', footerHTML);
    } else {
        console.error("Error: El elemento body no fue encontrado.");
    }
});