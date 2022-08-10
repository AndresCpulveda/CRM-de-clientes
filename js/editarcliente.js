//Variables
let DB;
const parametrosURL = new URLSearchParams(window.location.search); //Se hace una instancia de la clase que busca parametros en la URL
const idCliente = parametrosURL.get('id'); //Obtenemos la variable de id que previamentes enviamos por medio de la URL al abrir el html (ver videos 218-219)

//Selectors
const formulario = document.querySelector('#formulario');
const nombreInput = document.querySelector('#nombre');
const emailInput = document.querySelector('#email');
const telefonoInput = document.querySelector('#telefono');
const empresaInput = document.querySelector('#empresa');

document.addEventListener('DOMContentLoaded', () => {

  crearDB();

  formulario.addEventListener('submit', enviarFormulario)
})

function crearDB() {
  const openDB = window.indexedDB.open('crm', 1);

  openDB.onerror = () => { console.log('Hubo un error al abrir la DB'); }
  openDB.onsuccess = () => {
    DB = openDB.result;
    cargarEdicion(idCliente);
  }
}

function cargarEdicion(id) { //Obtiene el objeto a editar de la base de datos y lo guarda en una variable
  const objStore = DB.transaction(['crm'], 'readwrite').objectStore('crm');
  const request = objStore.openCursor(); //Se usa un cursor para iterar el object store hasta encontrar el objeto correspondinte al id dado
  request.onerror = () => { console.log('Error al abrir el cursor');}
  request.onsuccess = (e) => {
    const cursor = e.target.result;
    if(cursor) {
      if(cursor.value.id === Number(id)) {//Si el objeto siendo iterado contiene el id igual al id dado este objeto se guarda en una constante
        const toChange = cursor.value;
        llenarFormulario(toChange);
      }
      cursor.continue()
    }else {
      console.log('Todos los clientes reocrridos');
    }
  }
}

function llenarFormulario(toChange) {//Toma el objeto dado como parametro y extrae sus valores para ponerlos en el formulario de la interfaz
  const {nombre, email, telefono, empresa} = toChange;
  nombreInput.value = nombre;
  emailInput.value = email;
  telefonoInput.value = telefono;
  empresaInput.value = empresa;      
}

function enviarFormulario(e) {//Cuando el usuario envia el formulario con los datos editados
  e.preventDefault()
  //Se valida el formulario
  if(nombreInput === '' || emailInput === '' || telefonoInput === '' || empresaInput === '') {
    //showMessage('Todos los campos son obligatorios', 'error')
    showMessage('Todos los campos son obligatorios', 'error')
  }else {
    let clienteObj = { //Se crea un objeto con los nuevos valores del formulario
      nombre: nombreInput.value,
      email: emailInput.value,
      telefono: telefonoInput.value,
      empresa: empresaInput.value,
      id: Number(idCliente), //Se asigna el id enviado inicialmente por medio de la url de esta forma la BD se actualiza correctamente
      //MUY IMPORTANTE: El id es pasado como string en la URL, si no se convierte a number la actualizacion no se realizara correctamente y la request arrojara error
    };    
    editarDB(clienteObj);
  }
}

function editarDB(editedObj) { //Se toma el objeto creado y se actualiza la DB con este
  console.log(editedObj);
  const openTrans = DB.transaction(['crm'], 'readwrite');
  const objStore = openTrans.objectStore('crm');
  const request = objStore.put(editedObj); //Mediante el metodo put() reemplazamos el objeto del object store que contiene el mismo id (de tipo number) que el nuevo objeto 
  openTrans.onerror = () => { console.log('error');}
  openTrans.oncomplete = () => {
    showMessage('Cliente editado con exito')
    setTimeout(() => { //Despues de 3,5 segundos se envia el usuario a la pagina de index.html donde esta el listado de clientes
      window.location.href = 'index.html'
    }, 3500);
  }
}

function showMessage(mensaje, tipo) { //Muestra un corto mensaje en la interfaz
  const mensajeDiv = document.createElement('div');
  mensajeDiv.textContent = mensaje;
  mensajeDiv.classList.add('uppercase', 'border-2', 'p-2', 'my-5', 'border-red-500', 'text-center', 'min-w-full');
  if(tipo === 'error') {//Si es un mensaje de error se agregan estilos rojos
    mensajeDiv.classList.remove('text-greenn-700', 'border-green-700')
    mensajeDiv.classList.add('text-red-700', 'border-red-700')
  }else{//Si no es un mensaje de error se agregan estilos verdes
    mensajeDiv.classList.remove('text-red-700', 'border-red-700')
    mensajeDiv.classList.add('text-green-700', 'border-green-700')
  }
  formulario.appendChild(mensajeDiv)
  setTimeout(() => { //El mensaje se borra tras 3 segundos
    mensajeDiv.remove();
  }, 3000);
}