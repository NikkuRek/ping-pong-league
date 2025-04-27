document.addEventListener('DOMContentLoaded', function() {
    
    const player = { //variable objeto player para usarlo para validar el boton enviar
        Nombre : '',
        Apellido : '',
        Semestre : '',
        Carrera : '',
        Teléfono : '',
        Prefijo : '',
        Nivel : '',
        diaSelecionado : ''
    }
    //creación de variables constante para pasarle los inputs
    const inputPlayerName = document.querySelector('#player-name');
    const inputPlayerLastName = document.querySelector('#player-lastname');
    const inputPlayerCI = document.querySelector('#player-CI');
    const inputPlayerSemester = document.querySelector('#player-semester');
    const inputPlayerCareer = document.querySelector('#player-career');
    const inputPlayerPhone = document.querySelector('#player-phone');
    const inputPlayerPhonePrefix = document.querySelector('#player-phone-prefix');
    const inputPlayerTier = document.querySelector('#player-tier');
    
    //creación de variables constantes para pasarles los checkboxs
    const checkBoxMonday = document.querySelector('#monday');
    const checkBoxTuesday = document.querySelector('#tuesday');
    const checkBoxWednesday = document.querySelector('#wednesday');
    const checkBoxThursday = document.querySelector('#thursday');
    const checkBoxFriday = document.querySelector('#friday');

    //variable constante para asignarle el evento al boton
    const btnSent = document.querySelector('#button-sent');

    //estos son los eventos que llaman a las funcion asignada cada que se interactua con un input
    inputPlayerName.addEventListener('blur', validateInput);
    inputPlayerName.addEventListener('input', validateInput);
    inputPlayerLastName.addEventListener('blur', validateInput);
    inputPlayerLastName.addEventListener('input', validateInput);
    inputPlayerCI.addEventListener('input', validateInput);
    inputPlayerCI.addEventListener('blur', validateInput);
    inputPlayerSemester.addEventListener('blur', validateInput);
    inputPlayerCareer.addEventListener('blur', validateInput);
    inputPlayerPhone.addEventListener('blur', validateInput);
    inputPlayerPhone.addEventListener('input', validateInput);
    inputPlayerPhonePrefix.addEventListener('blur', validateInput);
    inputPlayerTier.addEventListener('blur', validateInput);

    //estos son los eventos que llaman a sus respectivas funciones cada que se clickea un checkbox
    checkBoxMonday.addEventListener('input', validateCheckBox1);
    checkBoxTuesday.addEventListener('input', validateCheckBox2);
    checkBoxWednesday.addEventListener('input', validateCheckBox3);
    checkBoxThursday.addEventListener('input', validateCheckBox4);
    checkBoxFriday.addEventListener('input', validateCheckBox5);

    //esta es la funcion que valida todos los inputs
    function validateInput(event) {
        if(event.target.value.trim() === "") { // verifica que no esten vacios
            
            showAlert(`El campo ${event.target.name} es obligatorio`, event.target.parentElement); //muestra la alerta del error con el mensaje que le asignes
            player[event.target.name] = ''; //vacia la propiedad de la variable objecto para volver a evaluar el boton
            validatePlayer();
            return;
        }

        if(event.target.id === "player-name") { //con esta entrada solo evaluará cuando se interactue con el input del nombre
            this.value = this.value.replace(/[^A-Za-záéíóúüÁÉÍÓÚÜñÑ\s]/g, '');

            if(this.value.length < 4) { //asegura que no sea menor de 4 caracteres
                showAlert(`El nombre no puede contener menos de 4 caracteres`, event.target.parentElement);
                player[event.target.name] = ''; //vacia la propiedad de la variable objecto para volver a evaluar el boton
                validatePlayer();
                return;
            }
        }

        if(event.target.id === "player-lastname") {
            this.value = this.value.replace(/[^A-Za-záéíóúüÁÉÍÓÚÜñÑ\s]/g, '');

            if(this.value.length < 4) { //asegura que no sea menor de 4 caracteres
                showAlert(`El nombre no puede contener menos de 4 caracteres`, event.target.parentElement); //muestra la alerta del error con el mensaje que le asignes
                player[event.target.name] = ''; //vacia la propiedad de la variable objecto para volver a evaluar el boton
                validatePlayer();
                return;
            }
        }

        if(event.target.id === "player-CI") {
            this.value = this.value.replace(/[^0-9]/g, '');

            if(this.value < 10000000 || this.value > 35000000) { //asegura que no sea una cedula de un viejo o de un carajito
                showAlert("La cédula es inválida.", event.target.parentElement); //muestra la alerta del error con el mensaje que le asignes
                player[event.target.name] = ''; //vacia la propiedad de la variable objecto para volver a evaluar el boton
                validatePlayer();
                return;
            }
        }

        if(event.target.id === "player-phone") {
            this.value = this.value.replace(/[^0-9]/g, '');

            if(this.value.length < 7) { //asegura que no tenga menos de 7 digitos
                showAlert(`Número telefónico inválido`, event.target.parentElement); //muestra la alerta del error con el mensaje que le asignes
                player[event.target.name] = ''; //vacia la propiedad de la variable objecto para volver a evaluar el boton
                validatePlayer();
                return;
            }
        }
        
        cleanAlert(event.target.parentElement); //limpia el mensaje de alerta en dado caso que ya exista

        player[event.target.name] = event.target.value.trim(); //asigna el valor a la variable objeto

        validatePlayer(); //función para habilitar o deshabilitar el botón
    }
    
    function validateCheckBox1(event) {//una función para cada checkbox para determinar cual fue presionado especificamente

        const diasSeleccionados = document.querySelectorAll('input[type="checkbox"]:checked');
        
        if(!event.target.checked) { //entra a la funcion si y solo si no está checked
            if(diasSeleccionados.length === 0) { //evalua si existe aunque sea un checkbox checked
                player.diaSelecionado = '';
                showAlert(`Debes seleccionar al menos un día`, event.target.parentElement.parentElement.parentElement);
                validatePlayer();
                return
            }
            return
        }
        else {
            player.diaSelecionado = 'Yes';
        }

        cleanAlert(event.target.parentElement.parentElement.parentElement); //limpia el mensaje de alerta en dado caso que ya exista
        validatePlayer();//evalua el boton para habilitarlo o no 
    }//así funciona para todos lo demás

    function validateCheckBox2(event){//una función para cada checkbox para determinar cual fue presionado especificamente
        const diasSeleccionados = document.querySelectorAll('input[type="checkbox"]:checked');
        if(!event.target.checked) { 
            if(diasSeleccionados.length === 0) {
                player.diaSelecionado = '';
                showAlert(`Debes seleccionar al menos un día`, event.target.parentElement.parentElement.parentElement);
                validatePlayer();
                return
            }
            return
        }
        else {
            player.diaSelecionado = 'Yes';
        }

        cleanAlert(event.target.parentElement.parentElement.parentElement);
        validatePlayer();
    }

    function validateCheckBox3(event){//una función para cada checkbox para determinar cual fue presionado especificamente
        const diasSeleccionados = document.querySelectorAll('input[type="checkbox"]:checked');
        if(!event.target.checked) { 
            if(diasSeleccionados.length === 0) {
                player.diaSelecionado = '';
                showAlert(`Debes seleccionar al menos un día`, event.target.parentElement.parentElement.parentElement);
                validatePlayer();
                return
            }
            return
        }
        else {
            player.diaSelecionado = 'Yes';
        }

        cleanAlert(event.target.parentElement.parentElement.parentElement);
        validatePlayer();
    }

    function validateCheckBox4(event){//una función para cada checkbox para determinar cual fue presionado especificamente
        const diasSeleccionados = document.querySelectorAll('input[type="checkbox"]:checked');
        
        if(!event.target.checked) { 
            if(diasSeleccionados.length === 0) {
                player.diaSelecionado = '';
                showAlert(`Debes seleccionar al menos un día`, event.target.parentElement.parentElement.parentElement);
                validatePlayer();
                return
            }
            return
        }
        else {
            player.diaSelecionado = 'Yes';
        }

        cleanAlert(event.target.parentElement.parentElement.parentElement);
        validatePlayer();
    }

    function validateCheckBox5(event){//una función para cada checkbox para determinar cual fue presionado especificamente
        const diasSeleccionados = document.querySelectorAll('input[type="checkbox"]:checked');
        if(!event.target.checked) { 
            if(diasSeleccionados.length === 0) {
                player.diaSelecionado = '';
                showAlert(`Debes seleccionar al menos un día`, event.target.parentElement.parentElement.parentElement);
                validatePlayer();
                return
            }
            return
        }
        else {
            player.diaSelecionado = 'Yes';
        }

        cleanAlert(event.target.parentElement.parentElement.parentElement);
        validatePlayer();
    }
    function validateTrue() {
        validate = true;
    }

    function showAlert(message, reference) { //muestra la alerta con el mensaje indicado

        cleanAlert(reference);

        const error = document.createElement('P');
        error.textContent = message;
        error.classList.add('text-white');
        reference.appendChild(error);   
    }

    function cleanAlert(event) { //limpia la alerta si ya existe para que no se duplique

        const alert = event.querySelector('.text-white');
        if(alert) {
            alert.remove();
        }
    }

    function validatePlayer() { //evalua el para deshabilitar el boton o no

        if(Object.values(player).includes('')) { //devuelve un true si encuentra un campo vacio 
            btnSent.disabled = true;
            return;
        }

        btnSent.disabled = false;

    }

});

//muestra el mensaje en la clase del boton cuando está deshabilitado
document.getElementById('button-sent').setAttribute('data-tooltip', 'Completa el formulario para habilitar'); 