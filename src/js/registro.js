

class registro{
    constructor() {
        this.carreras = [];
        this.tiers = [];
        this.setupEventListeners(); // Mover la configuración del evento aquí
    };

    getCarrer = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/career');
            this.carreras = response.data.data;
            console.log(response.data.data); // Verifica que los datos se hayan cargado correctamente
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    getTier = async ()=>{
        try {
            const response = await axios.get('http://localhost:3000/api/tier');
            this.tiers = response.data.data;
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    cargarCarreras = async()=> {
        await getCarrer(); // Asegúrate de que los datos se obtengan antes de cargar las opciones
        const select = document.getElementById('player-career');
        
        if (!select) {
            console.error("No se encontró el elemento select con ID 'player-career'");
            return;
        }

        select.innerHTML = ''; // Limpia las opciones existentes

        if (this.carreras.length === 0) {
            console.warn("No se encontraron carreras en la respuesta");
            return;
        }

        carreras.forEach((carrera) => {
            const option = document.createElement('option');
            option.value = this.carrera.id;
            option.textContent = this.carrera.name_career;
            select.appendChild(option);
        });
        console.log("Carreras cargadas exitosamente");
    };

    cargarTier = async () => {
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
            option.value = this.tier.id_tier;
            option.textContent = this.tier.range;
            select.appendChild(option);
        });
        console.log("Tiers cargados exitosamente");
    };

    // Ejecuta la función al cargar el DOM
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            this.cargarCarreras();
            this.cargarTier();
        });
    };
    
    setupFormSubmitListener() {
        const form = document.getElementById('register');
        if (form) {
            form.addEventListener('submit', async (event) => {
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
                        document.getElementById('register').reset(); 
                    })
                    .catch((error) => {
                        console.error('Error al enviar los datos:', error);
                    });
            });
        } else {
            console.error("No se encontró el formulario con ID 'register'");
        }
    }
};

registro = new registro(); // Instancia la clase registro