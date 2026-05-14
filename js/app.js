let registros = [];         // arreglo global para recuperar todos los registros
let registrosMostrar = [];  // arreglo para asignar registros que se van a mostrar
let registrosPorPagina = 5; // registros por página, valor inicial
let paginaActual = 1;
let columnaOrden = null;      // administra las columnas que se pueden ordenar
let direccionOrden = 'asc';   // dirección del orden 'asc' o 'desc'
let idSelec = "";
let filaSelec ="";
let accionAct = "";

$(document).ready(function () {

    //verificarBaseDatos();

    // Listeners de clicks en botones de funciones del panel principal
    $('#btnConvMostrar').on('click', function () {
        if (accionAct) {
            $('#btnCerrarTabla').trigger('click');
        }
        accionAct = "verconv";
        animacionCarga();
    });

    $('#btnConvAgregar').on('click', function () {
        $('#tablaDatos').addClass('element-disabled');
        $('#menuP').addClass('element-disabled');
        $('#formConvocatoria').fadeIn(400);  // Hace visible el formulario oculto con animación de "Aparecer"
        $('#tituloForm').text("Nueva convocatoria");
        $('#leyendaR').text("Registra los datos de la convocatoria.");
        accionAct = "verconv";
        animacionCarga();
    });

    $('#btnProvMostrar').on('click', function () {
        if (accionAct) {
            $('#btnCerrarTabla').trigger('click');
        }
        accionAct = "verprov";
        animacionCarga();
    });

    $('#btnProvAgregar').on('click', function () {
        $('#tablaDatos').addClass('element-disabled');
        $('#menuP').addClass('element-disabled');
        $('#formProveedor').fadeIn(400);  // Hace visible el formulario oculto con animación de "Aparecer"
        $('#tituloFormProv').text("Nueva proveedor");
        $('#leyendaR').text("Captura los datos del nuevo proveedor.");
        accionAct = "verprov";
        animacionCarga();
    });

    $('#btnPostMostrar').on('click', function() {
        $('#leyendaT').text("Proximamente.");
    });

    $('#btnPostAgregar').on('click', function() {
        $('#leyendaT').text("Proximamente.");
    });

    $('#btnConvCancelar').on('click', function () {
        const texto = "Registro cancelado";
        $('#leyendaT').text("Elija una opción");
        cerrarFormConv(texto);
    });

    $('#btnProvCancelar').on('click', function () {
        const texto = "Registro cancelado";
        $('#leyendaT').text("Elija una opción");
        cerrarFormProv(texto);
    });

    // Respuesta al submit del formulario de Agregar y Edición de Convocatorias
    $('#formConv').on('submit', function (e) {
        e.preventDefault();
        guardarConvocatoria();        
    });

    // Respuesta al submit del formulario de Agregar y Edición de Proveedores
    $('#formProv').on('submit', function (e) {
        e.preventDefault();
        guardarProveedor();
    });
    
});

function verificarBaseDatos() { 
    $.getJSON('api.php?action=check_db', function (res) {
        if (res.db_exists) {
            // Si existe base de datos, cargamos los registros
            $('#leyendaR').text('Conexión exitosa a la base de datos. Esperando acción del usuario.');
            //animacionCarga(); 
        } else {
            // Si no, mostrar botón para crear la base de datos
            $('#leyendaT').text('No se encontró la base de datos.');
            $('#tablaDatos').html(`
                <div>
                    <h4>No se encontró la base de datos</h4>
                    <p>Parece que es la primera vez que ejecutas la aplicación.</p>
                    <button id="btnCrearBD" class="btnactn">Crear BD desde XML</button>
                </div>
            `);
            $('#btnCrearBD').on('click', crearBDfake);
        }
    });
}

function crearBDfake() {
    $('#leyendaR').text('Base de datos creada con 100 registros.');
     //animacionCarga();
}

function crearBaseDatos() {  //Función desactivada para llevar a ambiente de pruebas
    $.getJSON('api.php?action=create_db', function (res) {
        if (res.status === 'db_created') {
            $('#leyendaR').text(`Base de datos creada con ${res.records || 0} registros.`);
            animaCargaConvocatorias(); 
        } else if (res.status === 'err_create') {
            $('#leyendaR').text('No se pudo crear la base de datos o leer el archivo XML. Vuelva a intentarlo');
        } else {
            $('#leyendaR').text('Error al crear la base de datos.');
        }
    });
}

function cargarConvocatorias() {
    $.ajax({
        url: 'api.php?action=cvc_read',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            registros = data;
            registrosMostrar = registros;
            paginaActual = 1;
            
            // Crear controles de paginación, buscador y selector de cantidad de registros
            generarControlesPag();
            
            // Muestra la página seleccionada; default página 1 si recién cargó registros
            mostrarPagina(paginaActual);
            $('#leyendaR').text(`Total de registros: ${registros.length}`);
        },
        error: function (err) {
            console.error(err);
            $('#leyendaR').text("Error al cargar las convocatorias.");
        }
    });
}

function cargarProveedores() {
    $.ajax({
        url: 'api.php?action=prov_read',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            registros = data;
            registrosMostrar = registros;
            paginaActual = 1;

            // Crear controles de paginación, buscador y selector de cantidad de registros
            generarControlesPag(); 

            // Muestra la página seleccionada; default página 1 si recién cargó registros
            mostrarPagina(paginaActual);
            $('#leyendaR').text(`Total proveedores: ${registros.length}`);
        },
        error: function (err) {
            console.error(err);
            $('#leyendaR').text("Error al cargar los proveedores.");
        }
    });
}

function mostrarPagina(pagina) {

    switch (accionAct) {
        case "verconv":
            buildTablaConv(pagina);
            break;

        case "verprov":
            buildTablaProv(pagina);
            break;

        default:
            // por definir
    }

    generarControlesNav();

    // Escucha los clicks en los encabezados de columna para dar orden
    $('#contenedorTabla th[data-col]').off('click').on('click', function () {
        const col = $(this).data('col');

        if (columnaOrden === col) {
            // Si ya está ordenando por esta columna, alternar asc/desc
            direccionOrden = direccionOrden === 'asc' ? 'desc' : 'asc';
        } else {
            // Si cambia de columna, reiniciar a ascendente
            columnaOrden = col;
            direccionOrden = 'asc';
        }

        ordenarRegistros();
        mostrarPagina(1);
    });

    // Escucha los clics en el botón eliminar de la tabla de registros
    $('.btnEliminar').on('click', function () {
        idSelec = $(this).val();

        // Selecciona la fila que se quiere eliminar
        filaSelec = $(`table.listaRegistros tbody tr`).filter(function () {
            return $(this).find('td:first').text() == idSelec;
        });

        confirmaEliminación(idSelec);
        
    });

    // Escucha los clics en el botón editar de la tabla de registros
    $('.btnEditar').on('click', function () {
        idSelec = $(this).val();
        const regEditar = registrosMostrar.find(c => c.id == idSelec);

        // Selecciona la fila que se quiere editar
        filaSelec = $(`table.listaRegistros tbody tr`).filter(function () {
            return $(this).find('td:first').text() == idSelec;
        });

        // Si la encuentra la resalta para hacerla más vivible al usuario
        if (filaSelec.length > 0) {

            filaSelec.addClass('fila-editar'); 
        } else {
            $('#leyendaR').text('No se pudo encontrar la convocatoria ' + idSelec + ' en la lista.');
            idSelec = "";
            return;
        }
        
        // Deshabilita las acciones en la Tabla de datos para evitar errores de flujo
        $('#tablaDatos').addClass('element-disabled');
        $('#menuP').addClass('element-disabled');

        // Recupera datos del registro seleccionado en el formulario que corresponda
        switch (accionAct) {
            case "verconv":
                $('#formConvocatoria').fadeIn(800);  // Hace visible el formulario
                $('#tituloForm').text("Actualizar convocatoria");
                $('#categoria').val(regEditar.categoria);
                $('#subcat').val(regEditar.subcat);
                $('#titulo').val(regEditar.tema);
                $('#fecha').val(regEditar.fcierre);
                $('#hora').val(regEditar.hcierre);
                $('#respons').val(regEditar.responsable);
                break;
            
            case "verprov":
                $('#formProveedor').fadeIn(800);  // Hace visible el formulario
                $('#tituloFormProv').text("Actualizar proveedor");
                $('#prov_nc').val(regEditar.nombre_comercial);
                $('#prov_rs').val(regEditar.razon_social);
                $('#prov_rfc').val(regEditar.rfc);
                $('#prov_dom').val(regEditar.domicilio);
                $('#prov_con').val(regEditar.contacto);
                $('#prov_tel').val(regEditar.telefono);
                $('#prov_cor').val(regEditar.correo);
                $('#prov_cat').val(regEditar.categoria);
                break;

            case error:
                break;
        }
        $('#leyendaR').text("Registro recuperado, actualiza los datos.");

    });
}

function buildTablaConv(pagina) {
    paginaActual = pagina;
    const inicio = (pagina - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const rango = registrosMostrar.slice(inicio, fin);

    // Construir tabla HMTL con los registros visibles
    let tabla = `
        <table border="1" class="listaRegistros">
            <thead>
                <tr>
                    <th data-col="id">ID</th>
                    <th >Categoría</th>
                    <th >Subcategoría</th>
                    <th data-col="tema">Tema</th>
                    <th data-col="fcierre">Fecha cierre</th>
                    <th data-col="hcierre">Hora cierre</th>
                    <th >Responsable</th>
                    <th >Accion</th>
                </tr>
            </thead>
        <tbody>
    `;

    rango.forEach(r => {
        tabla += `
            <tr>
                <td>${r.id}</td>
                <td>${r.categoria}</td>
                <td>${r.subcat}</td>
                <td>${r.tema}</td>
                <td>${r.fcierre}</td>
                <td>${r.hcierre}</td>
                <td>${r.responsable}</td>
                <td><button class="btnEditar" value=${r.id}>Editar</button>
                    <button class="btnEliminar" value=${r.id}>Eliminar</button></td>
            </tr>
        `;
    });

    tabla += `</tbody></table>`;
    $('#contenedorTabla').html(tabla);
}

function buildTablaProv(pagina) {
    paginaActual = pagina;
    const inicio = (pagina - 1) * registrosPorPagina;
    const fin = inicio + registrosPorPagina;
    const rango = registrosMostrar.slice(inicio, fin);

    // Construir tabla HMTL con los registros visibles
    let tabla = `
        <table border="1" class="listaRegistros">
            <thead>
                <tr>
                    <th data-col="id">ID</th>
                    <th >Proveedor</th>
                    <th data-col="rs">Razón social</th>
                    <th >RFC</th>
                    <th data-col="contacto">Contacto</th>
                    <th >Teléfono</th>
                    <th data-col="categoria">Categoría</th>
                    <th >Accion</th>
                </tr>
            </thead>
        <tbody>
    `;

    rango.forEach(r => {
        tabla += `
            <tr>
                <td>${r.id}</td>
                <td>${r.nombre_comercial}</td>
                <td>${r.razon_social}</td>
                <td>${r.rfc}</td>
                <td>${r.contacto}</td>
                <td>${r.telefono}</td>
                <td>${r.categoria}</td>
                <td><button class="btnEditar" value=${r.id}>Editar</button>
                    <button class="btnEliminar" value=${r.id}>Eliminar</button></td>
            </tr>
        `;
    });

    tabla += `</tbody></table>`;
    $('#contenedorTabla').html(tabla);
}

function generarControlesPag() {
    // Constructor de controles de paginación y búsqueda
    let controles = `
        <div class="controles" id="controlesTabla">
            <div>
                <label>Mostrar 
                    <select id="selectCantidad">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                    </select> registros por página
                </label>
            </div>

            <div>
                <label>Buscar:
                    <input type="text" id="txtBuscar" placeholder="Subcategoría o Tema" >
                    <button id="btnBuscar"><img src="https://cdn-icons-png.flaticon.com/512/14/14562.png" width="15"></button>
                </label>
            </div>
            <div id="paginacion"></div>
            <div id="btnCerrar">
                <button id="btnCerrarTabla">Cerrar</button>
            </div>
            
        </div>
        <div id="contenedorTabla"></div>
    `;

    $('#tablaDatos').html(controles);
    $('#leyendaT').text(`Total de registros: ${registrosMostrar.length}`);

    // Llama al ajuste de registrosPorPágina al cambiar el selector de cantidad
    $('#selectCantidad').on('change', function () {
        registrosPorPagina = parseInt($(this).val());
        paginaActual = 1;
        mostrarPagina(paginaActual);
    });

    // Llama a la función de filtrarRegistros, al recibir un "Enter" en el cuadro de búsqueda
    $('#txtBuscar').keyup(function (e) {
        if (e.keyCode === 13) {
            $('#btnBuscar').trigger('click');
        }
    });

    // Escucha el click en el btnBuscar para llamar a la función de filtrarRegistros
    $('#btnBuscar').on('click', function () {
        const texto = $('#txtBuscar').val().toLowerCase();
        filtrarRegistros(texto);
    });

    // Escucha el click en el btnCerrarTabla para remover el contenido de la Tabla de Datos
    $('#btnCerrarTabla').on('click', function () {
        //const texto = $('#txtBuscar').val().toLowerCase();
        accionAct = "";
        registros.length = 0;
        registrosMostrar.length = 0;
        $('#controlesTabla').remove();
        $('#contenedorTabla').remove();
        $('#leyendaT').text("Elija una opción");
    });
}

function generarControlesNav() {
    const totalPaginas = Math.ceil(registrosMostrar.length / registrosPorPagina);
    let html = '';
    let btnnxt ='disabled';
    let btnfwd = 'disabled';

    // Construir botón Anterior
    if (paginaActual > 1) { btnfwd='';}
    html += `<button ` + btnfwd + ` class="btnPag" data-page="${paginaActual - 1}"><</button>`;

    // Construir botones de números de página
    for (let i = 1; i <= totalPaginas; i++) {
        html += `<button class="btnPag ${i === paginaActual ? 'activo' : ''}" data-page="${i}">${i}</button>`;
    }

    // Construir botón Siguiente
    if (paginaActual < totalPaginas) { btnnxt='';}
    html += `<button ` + btnnxt + ` class="btnPag" data-page="${paginaActual + 1}">></button>`;

    $('#paginacion').html(html);

    // Escuchar clics de los botones de navegación entre páginas
    $('.btnPag').on('click', function () {
        const nuevaPagina = parseInt($(this).data('page'));
        mostrarPagina(nuevaPagina);
    });
}

function ordenarRegistros() {
    const datos = registrosMostrar;

    datos.sort((a, b) => {
        let valA = a[columnaOrden];
        let valB = b[columnaOrden];

        // Si es numérico (ID)
        if (columnaOrden === 'id') {
            valA = parseInt(valA);
            valB = parseInt(valB);
        }

        // Si es fecha (fcierre)
        if (columnaOrden === 'fcierre') {
            valA = new Date(valA);
            valB = new Date(valB);
        }

        if (valA < valB) return direccionOrden === 'asc' ? -1 : 1;
        if (valA > valB) return direccionOrden === 'asc' ? 1 : -1;
        return 0;
    });
}

function filtrarRegistros(texto) {
    if (texto.trim() === '') {  // Si no hay texto, se muestran todos los registros
        registrosMostrar = [...registros];
    } else {
        registrosMostrar = registros.filter(r =>
            r.subcat.toLowerCase().includes(texto) ||
            r.tema.toLowerCase().includes(texto)
        );
    }

    let canReg = registrosMostrar.length;
    $("#dialogAvisos").data("cierreAuto", true).html(`Se encontraron ${canReg} registros`).dialog({
        title: "Resultados de la búsqueda",
        modal: true,
        buttons: {

        },
        open: function () {
            if ($(this).data("cierreAuto")) {
                setTimeout(() => {
                    $(this).parent().fadeOut(800, () => {
                        $(this).dialog("close");
                    });
                }, 1500);
            }
        }
    });
        
    // Recargar la primera página de datos
    paginaActual = 1;
    mostrarPagina(paginaActual);
}

function guardarConvocatoria() {
    const categoria = $('#categoria').val().trim();
    const subcat = $('#subcat').val().trim();
    const tema = $('#titulo').val().trim();
    const fcierre = $('#fecha').val();
    const hcierre = $('#hora').val();
    const responsable = $('#respons').val().trim();
    
    let actiontype = idSelec !== "" ? 'cvc_update' : 'cvc_add'; // Alterna la acción del fetch a agregar o edición

    if (!categoria || !subcat || !tema || !responsable ) {
        $("#dialogAvisos").html(`Por favor completa todos los campos antes de guardar`).dialog({
            title: "Campos incompletos",
            modal: true,
            buttons: {
                "Aceptar": function () {
                    $(this).dialog("close");
                }
            }
        });
        return;
    }

    fetch(`api.php?action=${actiontype}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: idSelec,
            categoria: categoria,
            subcat: subcat,
            tema: tema,
            fcierre: fcierre,
            hcierre: hcierre,
            responsable: responsable
        })
    })

    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (idSelec != "") {
                animacionCarga(); // recarga la tabla después de confirmar registro
            } else { 
                console.log('Está saliendo con agregar fila, correctamente. ID actualzado: '. id);
                agregarFilaAnimada(data.registro);
            }
            cerrarFormConv(data.message);
        } else {
            $('#leyendaR').text(data.message);
        }
    })
    .catch(error => {
        console.log(idSelec);
        console.error('Error:', error);
        $('#leyendaR').text('Error en la conexión con el servidor.');
    });
}

function guardarProveedor() {
    const p_nc = $('#prov_nc').val().trim();
    const p_rs = $('#prov_rs').val().trim();
    const p_rfc = $('#prov_rfc').val().trim();
    const p_dom = $('#prov_dom').val().trim();
    const p_con = $('#prov_con').val().trim();
    const p_tel = $('#prov_tel').val();
    const p_cor = $('#prov_cor').val().trim();
    const p_cat = $('#prov_cat').val().trim();
    
    let actiontype = idSelec !== "" ? 'prov_update' : 'prov_add'; // Alterna la acción del fetch a agregar o edición

    if (!p_nc || !p_rs || !p_rfc || !p_con || !p_cor ) {
        $("#dialogAvisos").html(`Por favor completa todos los campos antes de guardar`).dialog({
            title: "Campos incompletos",
            modal: true,
            buttons: {
                "Aceptar": function () {
                    $(this).dialog("close");
                }
            }
        });
        return;
    }

    fetch(`api.php?action=${actiontype}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: idSelec,
            nc: p_nc,
            rs: p_rs,
            rfc: p_rfc,
            dom: p_dom,
            con: p_con,
            tel: p_tel,
            cor: p_cor,
            cat: p_cat
        })
    })

    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (idSelec != "") {
                animacionCarga(); // recarga la tabla después de confirmar registro
            } else { 
                agregarFilaAnimada(data.registro);
            }
            cerrarFormProv(data.message);
        } else {
            $('#leyendaR').text(data.message);
        }
    })
    .catch(error => {
        console.log(idSelec);
        console.error('Error:', error);
        $('#leyendaR').text('Error en la respuesta del servidor.');
    });
}


function confirmaEliminación(idC) {

    let actn = "";
    // Resalta la fila a eliminar para hacerla más visible al usuario
    if (filaSelec.length > 0) {
        filaSelec.addClass('fila-eliminar');  
    } else {
        $('#leyendaR').text('No se pudo encontrar el registro ' + idC + ' en la lista.');
        idSelec = "";
        return;
    }

    // Lanza diálogo de confirmación al usuario
    $("#dialogAvisos").data("cierreAuto", false).html(`¿Seguro que deseas eliminar el registro con ID ${idC}?`).dialog({
        title: "Confirmar eliminación",
        modal: true,
        buttons: {        
            "Eliminar": function () {
                switch (accionAct) {
                    case "verconv":
                        actn ="cvc_delete";
                        break;

                    case "verprov":
                        actn ="prov_delete";
                        break;
                }
                setTimeout(() => eliminarRegistro(idC, actn), 250);
                $(this).dialog("close");
            },
            "Cancelar": function () {
                filaSelec.removeClass('fila-eliminar');
                filaSelec = "";
                idSelec = "";
                $(this).dialog("close");
                return;
            }
        }
    });
}

function eliminarRegistro(idC, actn) {

    fetch(`api.php?action=${actn}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: idC })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            $('#leyendaR').text(data.message);
            animacionEliminarFila();  // Envía la fila a eliminación con animación
        } else {
            $('#leyendaR').text(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        $('#leyendaR').text('Error en la conexión con el servidor.');
    });
}

function agregarFilaAnimada(r) {
    let nuevaFila = "";

    switch (accionAct) {
        case "verconv":
            nuevaFila = $(`
                <tr style="display:none">
                    <td>${r.id}</td>
                    <td>${r.categoria}</td>
                    <td>${r.subcat}</td>
                    <td>${r.tema}</td>
                    <td>${r.fcierre}</td>
                    <td>${r.hcierre}</td>
                    <td>${r.responsable}</td>
                    <td><button class="btnEditar" value="${r.id}">Editar</button>
                        <button class="btnEliminar" value="${r.id}">Eliminar</button>
                    </td>
                </tr>
            `);
            break;

        case "verprov":
            nuevaFila =$(`
                <tr style="display:none">
                <td>${r.id}</td>
                <td>${r.nombre_comercial}</td>
                <td>${r.razon_social}</td>
                <td>${r.rfc}</td>
                <td>${r.contacto}</td>
                <td>${r.telefono}</td>
                <td>${r.categoria}</td>
                <td><button class="btnEditar" value=${r.id}>Editar</button>
                    <button class="btnEliminar" value=${r.id}>Eliminar</button></td>
                </tr>
            `);
            break;     
    }
    
    $('table.listaRegistros tbody').prepend(nuevaFila);
    nuevaFila.fadeIn(1800);
    nuevaFila.addClass('nueva-fila');
    setTimeout(() => nuevaFila.removeClass('nueva-fila'), 3500);
}

function animacionEliminarFila() {

    // Animación suave de eliminación
    filaSelec.fadeOut(1000, function () {
        $(this).remove(); 
    });
    idSelec="";
    filaSelec=""
}

function cerrarFormConv(motivo) { 
    $('#formConv')[0].reset();  // Limpia el formulario de datos del usuario
    $('#tablaDatos').removeClass('element-disabled');
    $('#menuP').removeClass('element-disabled');
    $('#formConvocatoria').fadeOut(400);  // Oculta el formulario de registro con animación de "Desaparecer"
    $('#leyendaR').text(motivo);
    if (idSelec != "") {
        filaSelec.removeClass('fila-editar');
    }
    filaSelec="";
    idSelec="";    
}

function cerrarFormProv(motivo) {
    $('#formProv')[0].reset();  // Limpia el formulario de datos del usuario
    $('#tablaDatos').removeClass('element-disabled');
    $('#menuP').removeClass('element-disabled');
    $('#formProveedor').fadeOut(400);  // Oculta el formulario de registro con animación de "Desaparecer"
    $('#leyendaR').text(motivo);
    if (idSelec != "") {
        filaSelec.removeClass('fila-editar');
    }
    filaSelec="";
    idSelec="";  
}

function animacionCarga() {
    
    // Mostrar barra de progreso oculta
    $('#barraContainer').show();
    $('#leyendaR').text('Cargando registros');

    // Deshabilita el menú para evitar clicks durante animación
    $('#menuP').addClass('element-disabled');

    let progreso = 0;
    let intervalo = setInterval(() => {
        progreso += 1; //  Incremento del 1% cada 25ms 
        $('#barraProgreso').css('width', progreso + '%').text(progreso + '%');

        if (progreso >= 100) {
            clearInterval(intervalo);
            $('#barraContainer').fadeOut();  // Ocultar barra al llegar al 100%
            
            // Reactiva menú a la normalidad
            $('#menuP').removeClass('element-disabled');
            
            // Ejecuta la función de carga de registros después de la animación
            switch (accionAct) {
                case "verconv":
                    cargarConvocatorias();
                    break;

                case "verprov":
                    cargarProveedores();
                    break;

                default:
                    // por definir
            }
        }
    }, 25); 
}

