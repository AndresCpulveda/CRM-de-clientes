//Variables
let DB;
//Selectors
const listaClientes = document.querySelector('#listado-clientes');

document.addEventListener('DOMContentLoaded', () => {
  crearBD();
})

//Crea la base de datos de indexedDB
function crearBD() {
  const creationRequest = window.indexedDB.open('crm', 1); //Hace un request para abrir la base de datos en su version 1

  creationRequest.onerror = () => console.log('Hubo error al crear la BD'); //Muestra un error en consola si el request no se ejecuta correctamente
  creationRequest.onsuccess = function() {
    DB = creationRequest.result; //Si el request se ejecuta correctamente el resultado de este (la base de datos) se guarda en la variable declarada globalmente
    mostrarClientes();
  } 
    
  
  creationRequest.onupgradeneeded = function(e) { //Evento que se ejecuta cada que la base es creada por primera vez o si su version es cambiada
    const db = e.target.result; //Se guarda el resultado del evento en una constante
    
    const objStore = db.createObjectStore('crm', { //Se especifica el nombre del object store y se define el keypath de los datos y si tiene autoincrement
      keyPath: 'id',
      autoincrement: true,
    })
    
    //Se definen los index del object store
    objStore.createIndex('nombre', 'nombre', {unique: false});
    objStore.createIndex('email', 'email', {unique: true});
    objStore.createIndex('telefono', 'telefono', {unique: false});
    objStore.createIndex('empresa', 'empresa', {unique: false});
    objStore.createIndex('id', 'id', {unique: true});

    console.log('DB creada y lista');
  }
}

//Mostrar listado de clientes
function mostrarClientes() {
  limpiarHTML();
  const openTrans = DB.transaction(['crm'], 'readwrite').objectStore('crm'); //Se abre la transaction y el object store
  const request = openTrans.openCursor(); //Se realiza la request de open cursor para iterar los objetos en el object store
  request.onsuccess = (e) => {
    const cursor = e.target.result; //Si la request es exitosa se toma el resultado de esta (el valor iterando) 
    if(cursor) {//Si el valor existe:
      const {nombre, email, telefono, empresa, id} = cursor.value; //Se destructura el objeto
      //Iniciamos el scripting de la HTML table donde se mostrarán los clientes
      const row = document.createElement('tr');
      
      const tablaCliente = document.createElement('th');
      const clienteNombre = document.createElement('p');
      clienteNombre.textContent = nombre;
      clienteNombre.classList.add('text-black-500', 'uppercase', "font-medium")
      const clienteEmail = document.createElement('p');
      clienteEmail.textContent = email;
      clienteEmail.classList.add('text-gray-500', "font-small")
      tablaCliente.append(clienteNombre, clienteEmail)
      tablaCliente.classList.add("px-6", "py-3", "border-b", "border-gray-200", "text-left", "text-xs", "leading-4", "tracking-wider")
      
      const tablaTelefono = document.createElement('th');
      tablaTelefono.textContent = telefono;
      tablaTelefono.classList.add("px-6", "py-3", "border-b", "border-gray-200", "text-left", "text-xs", "leading-4", "font-medium", "text-gray-500", "uppercase", "tracking-wider")
      
      const tablaEmpresa = document.createElement('th');
      tablaEmpresa.textContent = empresa;
      tablaEmpresa.classList.add("px-6", "py-3", "border-b", "border-gray-200", "text-left", "text-xs", "leading-4", "font-medium", "text-gray-500", "uppercase", "tracking-wider")
      
      const tablaBtns = document.createElement('th');
      const tablaEditarBtn = document.createElement('a')
      tablaEditarBtn.textContent = 'Editar';
      tablaEditarBtn.href = `editar-cliente.html?id=${id}` //Al boton de editar le asignamos el href del html donde se editaran los clientes y se incluye la variable de id en la url para poder ser usado en el otro archivo (ver videos 218-219)
      tablaEditarBtn.classList.add('px-2', 'text-blue-600', 'cursor-pointer');
    
      const tablaBorrarBtn = document.createElement('a');
      tablaBorrarBtn.textContent = 'Borrar';
      tablaBorrarBtn.classList.add('px-2', 'text-red-600', 'cursor-pointer');
      tablaBorrarBtn.onclick = () => { //Se agrega una funcion al boton de borrar
        borrarCliente(id)
      }

      tablaBtns.classList.add('px-6', 'ay-4', 'text-left', "border-b", "border-gray-200", "text-xs", "leading-5", 'font-medium', "uppercase")
      tablaBtns.append(tablaEditarBtn, tablaBorrarBtn);
      
      row.append(tablaCliente, tablaTelefono, tablaEmpresa, tablaBtns);
      listaClientes.append(row)


      cursor.continue(); //Se usa el metodo continue para que el cursor continue al siguiene elemento por iterar
    }else {
      console.log('No hay mas clientes'); //Una vez el cursor se situa en un elemento inexistente se envia este mensaje en consola
    }
  }
}


function borrarCliente(id) { //Toma el id enviado y borra el elemento correspondiente de la base de datos
  const confirmar = confirm('¿Deseas eliminar este cliente?')
  if(confirmar){
    const request = DB.transaction(['crm'], 'readwrite').objectStore('crm').delete(id); //Se abre la transaction, el object store y se realiza el request de delete
    request.onsuccess = () => { //Si el request se ejecuta correctamente entonces el objeto ha sido borrado de la DB
      console.log('Cliente borrado de la DB');
      mostrarClientes(); //Una vez borrado se pide volver a mostrar los clientes en el HTML
    }
  }
}

function limpiarHTML() { //Limpia el html borrando de uno en uno los elementos hijos del elemento padre: listado-clientes
  while(listaClientes.firstChild){
    listaClientes.removeChild(listaClientes.firstChild)
  }
}