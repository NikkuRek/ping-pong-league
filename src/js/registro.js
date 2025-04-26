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

    // Seleccionar todos los elementos tipo checkbox
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    // Crear un arreglo para almacenar los checkboxes activos
    const checkboxesActivos = [];

    // Recorrer cada checkbox y verificar si está marcado y guardarlo en el arreglo
    checkboxes.forEach((checkbox) => {
    if (checkbox.checked) {
        checkboxesActivos.push(checkbox.value);
    }
    });

    // Mostrar los valores de los checkboxes activos
    console.log(checkboxesActivos);

    let playerData = {
        playerData: {
            CI: data['player-CI'],
            first_name: data['player-name'],
            last_name: data['player-lastname'],
            phone: data['player-phone'],
            semester: data['player-semester'],
            id_career: data['player-career'],
            id_tier: data['player-tier'],
            status: true, // Cambia esto según tu lógica
        },
        available_days: checkboxesActivos  // Aquí se asigna el arreglo de checkboxes activos
    };

    console.log(playerData); // Muestra el objeto en la consola para verificar su contenido

    // Enviar los datos al servidor
    axios.post('http://localhost:3000/api/player', playerData)
        .then((response) => {
            console.log('Datos enviados exitosamente:', response.data);
        })
        .catch((error) => {
            console.error('Error al enviar los datos:', error);
        });
});
// Limpiar el formulario después de enviar los datos
//document.getElementById('register').reset(); // Limpia el formulario después de enviar los datos