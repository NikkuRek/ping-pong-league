let carreras = [];
let tiers = [];

async function getCarrer() {
    try {
        const response = await axios.get('http://localhost:3000/api/career');
        carreras = response.data.data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function getTier(){
    try {
        const response = await axios.get('http://localhost:3000/api/tier');
        tiers = response.data.data;
        console.log(tiers);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function cargarCarreras() {
    await getCarrer(); // Asegúrate de que los datos se obtengan antes de cargar las opciones
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

async function cargarTier() {
    await getTier(); // Asegúrate de que los datos se obtengan antes de cargar las opciones
    const select = document.getElementById('player-tier');
    
    if (!select) {
        console.error("No se encontró el elemento select con ID 'player-tier'");
        return;
    }

    select.innerHTML = ''; // Limpia las opciones existentes

    console.log(tiers);
    if (tiers.length === 0) {
        console.warn("No se encontraron tiers en la respuesta");
        return;
    }
    

    tiers.forEach((tier) => {
        const option = document.createElement('option');
        option.value = tier.id_tier;
        option.textContent = tier.range;
        select.appendChild(option);
    });
    console.log("Tiers cargados exitosamente");
}

// Ejecuta la función al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarCarreras();
    cargarTier();
});



//postData
/*a = {[    "CI": "31366298",
    "first_name": "Edgar",
    "last_name": "Briceño",
    "phone": "04262498651",
    "semester": 3,
    "id_career": 1,
    "id_tier": 2,
    "status": true,
    "createdAt": "2025-04-25T03:48:11.000Z",
    "updatedAt": "2025-04-25T03:48:11.000Z"]};*/

document.getElementById('register').addEventListener('submit', async (event) => {
    event.preventDefault(); // Evita el envío del formulario por defecto

    const formData = new FormData(event.target); // Obtiene los datos del formulario
    const data = Object.fromEntries(formData.entries()); // Convierte FormData a un objeto

    console.log(data); // Muestra los datos en la consola para depuración
});
// Limpiar el formulario después de enviar los datos
document.getElementById('register').reset(); // Limpia el formulario después de enviar los datos