//Variables
let DB;

//Selectors
const formulario = document.querySelector('#formulario');

document.addEventListener('DOMContentLoaded', () => {
  crearDB();

  formulario.addEventListener('submit', validarFormulario)
})

function crearDB() {
  const openDB = window.indexedDB.open('crm', 1); //Hace un request para abrir la base de datos en su version 1

  openDB.onerror = () => { console.log('Hubo un error al abrir la DB'); }//Muestra un error en consola si el request no se ejecuta correctamente
  openDB.onsuccess = () => {
    DB = openDB.result//Si el request se ejecuta correctamente el resultado de este (la base de datos) se guarda en la variable declarada globalmente
  }
}

function validarFormulario(e) { //Envia los datos del formulario a la base de datos como un objeto nuevo
  e.preventDefault();
  //Toma los values presentes en el formulario
  const nombreInput = document.querySelector('#nombre').value;
  const emailInput = document.querySelector('#email').value;
  const telefonoInput = document.querySelector('#telefono').value;
  const empresaInput = document.querySelector('#empresa').value;

  //Valida que los datos en el formulario no sean strings vacios
  if(nombreInput === '' || emailInput === '' || telefonoInput === '' || empresaInput === '') {
    showMessage('Todos los campos son obligatorios', 'error')//Si no pasa validacionn envia mensaje de error a la interfaz
  }else {
    let clienteObj = { //Guarda los datos del formulario en un objeto
      nombre: nombreInput,
      email: emailInput,
      telefono: telefonoInput,
      empresa: empresaInput,
    };    
    clienteObj.id = Date.now(); //Genera una propiedad id en el objeto y le asigna una id unico mediante el uso de Date.now
    agregarCliente(clienteObj);
  }
}

function agregarCliente(cliente) { //Agrega el objeto dado a la base de datos
  const openTrans = DB.transaction(['crm'], 'readwrite'); //Abre la transaction en la BD
  const addRequest = openTrans.objectStore('crm'); //Abre el object store
  console.log(addRequest);
  addRequest.add(cliente); //Hace el request de añadir el objeto al object store
  openTrans.onerror = () => {  showMessage('Hubo un error', 'error');} //Si la request no se ejecuta correctamente se muestra error en la consola
  openTrans.oncomplete = () => { //Si la request se completa exitosamente el objeto se agrego a la BD
    showMessage('Cliente agregado exitosamente');//Se muestra mensaje de exito en la interfaz
    formulario.reset();//Se reinicia el formulario
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