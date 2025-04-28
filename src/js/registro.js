class registerRequest {
    constructor() {
        this.carreras = [];
        this.tiers = [];
        this.setupEventListeners(); // Mover la configuración del evento aquí
        this.setupFormSubmitListener(); // Mover la configuración del evento aquí
    };

    getCarrer = async () => {
        try {
            const response = await axios.get('https://lpp-backend.onrender.com/api/career');
            this.carreras = response.data.data;
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    getTier = async () => {
        try {
            const response = await axios.get('https://lpp-backend.onrender.com/api/tier');
            this.tiers = response.data.data;
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    cargarCarreras = async () => {
        await this.getCarrer(); // Asegúrate de que los datos se obtengan antes de cargar las opciones
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

        this.carreras.forEach((carrera) => {
            const option = document.createElement('option');
            option.value = carrera.id;
            option.textContent = carrera.name_career;
            select.appendChild(option);
        });
        console.log("Carreras cargadas exitosamente");
    };

    cargarTier = async () => {
        await this.getTier(); // Asegúrate de que los datos se obtengan antes de cargar las opciones
        const select = document.getElementById('player-tier');

        if (!select) {
            console.error("No se encontró el elemento select con ID 'player-tier'");
            return;
        }

        select.innerHTML = ''; // Limpia las opciones existentes

        if (this.tiers.length === 0) {
            console.warn("No se encontraron tiers en la respuesta");
            return;
        }

        this.tiers.forEach((tier) => {
            const option = document.createElement('option');
            option.value = tier.id_tier;
            option.textContent = tier.range;
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

                // Seleccionar solo los checkboxes de disponibilidad
                const availabilityCheckboxes = form.querySelectorAll('.avalability input[type="checkbox"]:not(#btn-note)');

                // Crear un arreglo para almacenar los checkboxes activos
                const availableDays = [];

                // Recorrer cada checkbox y verificar si está marcado y guardarlo en el arreglo
                availabilityCheckboxes.forEach((checkbox) => {
                    if (checkbox.checked) {
                        availableDays.push(parseInt(checkbox.value, 10)); // Agregar el valor del checkbox al arreglo
                    }
                });

                // Mostrar los valores de los checkboxes activos
                console.log(availableDays);

                // Construir el objeto a enviar al backend (según el YAML y backend)
                let requestPayload = {
                    playerData: {
                        CI: data['Cédula'],
                        first_name: data['Nombre'],
                        last_name: data['Apellido'],
                        phone: data['Prefijo'] + data['Teléfono'],
                        semester: parseInt(data['Semestre'], 10),
                        id_career: parseInt(data['Carrera'], 10),
                        id_tier: parseInt(data['Nivel'], 10),
                    },
                    available_days: availableDays // Aquí se asigna el arreglo de checkboxes activos
                };

                console.log(requestPayload); // Muestra el objeto en la consola para verificar su contenido

                // Enviar los datos al servidor
                axios.post('https://lpp-backend.onrender.com/api/player', requestPayload)
                    .then((response) => {
                        console.log('Datos enviados exitosamente:', response.data);
                        this.showPopup('Jugador registrado exitosamente');
                        document.getElementById('register').reset();
                    })
                    .catch((error) => {
                        console.error('Error al enviar los datos:', error);

                        let errorMessage = 'Error al registrar jugador. Inténtalo de nuevo.';

                        if (axios.isAxiosError(error) && error.response) {
                            console.error('Datos del error:', error.response.data);
                            console.error('Estado del error:', error.response.status);

                            if (error.response.data && typeof error.response.data.message === 'string') {
                                errorMessage = error.response.data.message;
                            } else if (error.response.data && Array.isArray(error.response.data.errors)) {
                                errorMessage = 'Errores de validación:\n';
                                error.response.data.errors.forEach((err) => {
                                    errorMessage += `- ${err.msg || 'Error desconocido'}\n`;
                                });
                            } else {
                                errorMessage = `Error del servidor: ${error.response.status}`;
                            }

                        } else if (axios.isAxiosError(error) && error.request) {
                            console.error('No se recibió respuesta del servidor:', error.request);
                            errorMessage = 'No se pudo conectar con el servidor. Verifica que esté funcionando.';
                        } else {
                            console.error('Error de configuración de Axios:', error.message);
                            errorMessage = 'Ocurrió un error inesperado al preparar la solicitud.';
                        }

                        this.showPopup(errorMessage);
                    });
            });
        } else {
            console.error("No se encontró el formulario con ID 'register'");
        }
    }

    // Función para mostrar el pop-up con un mensaje
    showPopup(message) {
        // Seleccionar los elementos del pop-up
        const popupMessageElement = document.querySelector('.cont-note p');
        const popupCheckbox = document.getElementById('btn-note');
        const popupTitleElement = document.querySelector('.cont-note h2');
        const popupListItems = document.querySelectorAll('.cont-note ol');

        // Limpiar el contenido de h2, p y ol antes de mostrar el mensaje
        if (popupTitleElement) {
            popupTitleElement.textContent = '';
        }
        if (popupMessageElement) {
            popupMessageElement.textContent = '';
        }
        if (popupListItems) {
            popupListItems.forEach((ol) => {
                ol.textContent = '';
            });
        }

        if (popupMessageElement && popupCheckbox) {
            popupMessageElement.textContent = message;
            popupCheckbox.checked = true; // Marca el checkbox para mostrar el pop-up via CSS
        } else {
            // Si el pop-up no se encuentra, usar alert como fallback
            alert(message);
        }
    }

    // Función para ocultar el pop-up
    hidePopup() {
        const popupCheckbox = document.getElementById('btn-note');
        if (popupCheckbox) {
            popupCheckbox.checked = false; // Desmarca el checkbox para ocultar el pop-up
        }
    }
}

const requestHandler = new registerRequest();