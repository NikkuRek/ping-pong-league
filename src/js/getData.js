let carreras = [];

async function getData() {
    try {
        const response = await axios.get('http://localhost:3000/api/career');
        carreras = response.data.data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function cargarCarreras() {
    await getData(); // Asegúrate de obtener los datos antes de continuar
    const select = document.getElementById('player-career');
    
    if (!select) {
        console.error("No se encontró el elemento select con ID 'player-career'");
        return;
    }

    select.innerHTML = ''; // Limpia las opciones existentes

    if (carreras.length === 0) {
        console.warn("No se encontraron carreras en la respuesta");
        return;
    }

    carreras.forEach((carrera) => {
        const option = document.createElement('option');
        option.value = carrera.id;
        option.textContent = carrera.name_career;
        select.appendChild(option);
    });
    console.log("Carreras cargadas exitosamente");
}

// Ejecuta la función al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarCarreras();
});