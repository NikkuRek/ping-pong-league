let dataTable;
let dataTableISInitializated = false;

const dataTableOptions={
    pageLength: 5,
    lengthMenu: [5, 10, 20, 25, 30],
    destroy: true,

    language: {
        lengthMenu: "Mostrar _MENU_ registros por página",
        zeroRecords: "No se encontraron resultados",
        info: "Mostrando _START_ de _END_ de _TOTAL_ registros" , 
        infoEmpty: "No hay registros disponibles",
        infoFiltered: "(filtrado de _MAX_ registros totales)",
        search: "Buscar:",
        paginate: {
            first: "Primera",
            last: "Última",
            next: "Siguiente",
            previous: "Anterior"
        },
        loadingRecords: "Cargando...",
        processing: "Procesando...",
        emptyTable: "No hay datos disponibles en la tabla",
        infoPostFix: "",
        thousands: ",",
        decimal: ".",
        aria: {
            sortAscending: ": activar para ordenar la columna de forma ascendente",
            sortDescending: ": activar para ordenar la columna de forma descendente"
        },
        select: {
            rows: {
                _: "%d filas seleccionadas",
                0: "Clic para seleccionar una fila",
                1: "1 fila seleccionada"
            }
        },
    },

}

const initDataTable = async () => {
    if (dataTableISInitializated) {
        dataTable.destroy();
    }

    await listUsers();

    dataTable =  $("#player-table").DataTable(dataTableOptions);
    dataTableISInitializated = true;
    
}



const listUsers = async () => {

    let url = "https://magicloops.dev/api/loop/4eecbc3b-8910-4a01-80a4-d6e32e9e8d5f/run?example=data";
    try {
            const response = await fetch("PruebaJugadores.json");
            const players = await response.json();
        
            console.log(players);
            let tableBody = "";
        if (Array.isArray(players)) {
            players.forEach((player, index) => {
            tableBody += `
            <tr>
                <td>${player.Nombre}</td>
                <td>${player.Carrera}</td>
                <td>${player.Semestre}</td>
                <td>${player.Nivel}</td>
                <td>${player.Posicion}</td>
            </tr>`;
        });
        } else {
        console.warn("El objeto players no es un array:", players);
        }

        tableBody_jugadores.innerHTML = tableBody;

    } catch (ex) {
        alert("Error cargando el archivo JSON: " + ex.message);
        }
    
}


    window.addEventListener("load", async () => {
        await initDataTable();
    });