
const usuario = JSON.parse(sessionStorage.getItem("usuarioControlPark") || "null");

if (!usuario) {
    window.location.href = "/";
}

const correoUsuario = document.getElementById("usuarioCorreo");
const rolUsuario = document.getElementById("usuarioRol");
const parkingSpaces = document.getElementById("parkingSpaces");
const mapLoading = document.getElementById("mapLoading");
const mapError = document.getElementById("mapError");
const mapEmpty = document.getElementById("mapEmpty");
const selectionPanel = document.getElementById("selectionPanel");
const occupancyActions = document.getElementById("occupancyActions");
const vehicleSelect = document.getElementById("vehicleSelect");
const occupancyMessage = document.getElementById("occupancyMessage");
const occupancyButton = document.getElementById("occupancyButton");

const svgNamespace = "http://www.w3.org/2000/svg";
const idUsuario = usuario.idUsuario;

correoUsuario.textContent = usuario?.correo || "";

const nombresRol = {
    ALUMNO: "Estudiante",
    DOCENTE: "Docente",
    ADMINISTRADOR: "Administrador"
};

rolUsuario.textContent = nombresRol[usuario?.rol] || usuario?.rol || "";

let espacios = [];
let vehiculos = [];
let ocupacionActiva = null;
let espacioSeleccionado = null;
let tipoVehiculoActual = "AUTOMOVIL";
let numeroSolicitud = 0;
let procesandoOcupacion = false;

function crearElementoSVG(tipo, atributos = {}) {
    const elemento = document.createElementNS(svgNamespace, tipo);

    Object.entries(atributos).forEach(([atributo, valor]) => {
        elemento.setAttribute(atributo, valor);
    });

    return elemento;
}

function obtenerClaseEstado(estado) {
    const estados = {
        DISPONIBLE: "space-available",
        OCUPADO: "space-occupied",
        EN_REVISION: "space-review",
        FUERA_SERVICIO: "space-unavailable"
    };

    return estados[estado] || "space-unavailable";
}

function obtenerNombreEstado(estado) {
    const nombres = {
        DISPONIBLE: "Disponible",
        OCUPADO: "Ocupado",
        EN_REVISION: "En revisión",
        FUERA_SERVICIO: "Fuera de servicio"
    };

    return nombres[estado] || estado;
}

function actualizarContadores() {
    const disponibles = espacios.filter(e => e.estado === "DISPONIBLE").length;
    const ocupados = espacios.filter(e => e.estado === "OCUPADO").length;
    const revision = espacios.filter(e => e.estado === "EN_REVISION").length;
    const fueraServicio = espacios.filter(e => e.estado === "FUERA_SERVICIO").length;
    const total = espacios.length;

    document.getElementById("totalDisponibles").textContent = disponibles;
    document.getElementById("totalOcupados").textContent = ocupados;
    document.getElementById("totalRevision").textContent = revision;
    document.getElementById("totalFueraServicio").textContent = fueraServicio;
    document.getElementById("spaceCount").textContent = `${total} espacios registrados`;

    const porcentaje = cantidad => total > 0 ? `${cantidad / total * 100}%` : "0%";

    document.getElementById("availableBar").style.width = porcentaje(disponibles);
    document.getElementById("occupiedBar").style.width = porcentaje(ocupados);
    document.getElementById("reviewBar").style.width = porcentaje(revision);
    document.getElementById("unavailableBar").style.width = porcentaje(fueraServicio);
}

function actualizarAcciones(espacio) {
    occupancyActions.classList.remove("hidden");
    occupancyMessage.textContent = "";
    vehicleSelect.replaceChildren();

    const esOcupacionPropia = ocupacionActiva &&
        Number(ocupacionActiva.idEspacio) === Number(espacio.idEspacio);

    const vehiculosCompatibles = vehiculos.filter(
        vehiculo => vehiculo.tipo === espacio.tipoVehiculo
    );

    vehicleSelect.classList.add("hidden");
    occupancyButton.classList.add("hidden");
    occupancyButton.disabled = false;

    if (esOcupacionPropia) {
        occupancyButton.textContent = "Desocupar espacio";
        occupancyButton.classList.remove("hidden");
        occupancyButton.onclick = liberarEspacio;
        return;
    }

    if (ocupacionActiva) {
        occupancyMessage.textContent = "Ya tienes otro espacio ocupado. Debes desocuparlo antes de ocupar uno nuevo.";
        return;
    }

    if (espacio.estado !== "DISPONIBLE") {
        occupancyMessage.textContent = "Este espacio no está disponible para ocupar.";
        return;
    }

    if (vehiculosCompatibles.length === 0) {
        occupancyMessage.textContent = `No tienes vehículos registrados de tipo ${espacio.tipoVehiculo === "AUTOMOVIL" ? "automóvil" : "motocicleta"}.`;
        return;
    }

    vehiculosCompatibles.forEach(vehiculo => {
        const opcion = document.createElement("option");
        opcion.value = vehiculo.idVehiculo;
        opcion.textContent = `${vehiculo.placas} (${vehiculo.tipo === "AUTOMOVIL" ? "Automóvil" : "Motocicleta"})`;
        vehicleSelect.appendChild(opcion);
    });

    vehicleSelect.classList.remove("hidden");
    occupancyButton.textContent = "Ocupar espacio";
    occupancyButton.classList.remove("hidden");
    occupancyButton.onclick = ocuparEspacio;
}

function mostrarSeleccion(espacio, elemento) {
    if (espacioSeleccionado?.elemento) {
        espacioSeleccionado.elemento.classList.remove("space-selected");
    }

    espacioSeleccionado = { espacio, elemento };
    elemento.classList.add("space-selected");

    document.getElementById("selectedCode").textContent = espacio.codigo;
    document.getElementById("selectedZone").textContent =
        `Zona: ${espacio.zona === "GENERAL" ? "General" : "Docentes"}`;

    document.getElementById("selectedType").textContent =
        `Vehículo: ${espacio.tipoVehiculo === "AUTOMOVIL" ? "Automóvil" : "Motocicleta"}`;

    const estado = document.getElementById("selectedStatus");
    estado.textContent = obtenerNombreEstado(espacio.estado);
    estado.className = `status-label ${obtenerClaseEstado(espacio.estado)}`;

    actualizarAcciones(espacio);
    selectionPanel.classList.remove("hidden");
}

function dibujarEspacio(espacio) {
    const espaciosZona = espacios.filter(item => item.zona === espacio.zona);
    const indiceZona = espaciosZona.indexOf(espacio);
    const columna = indiceZona % 5;
    const fila = Math.floor(indiceZona / 5);

    const posicionX = espacio.zona === "GENERAL" ? 130 : 500;
    const posicionY = 190;

    const x = posicionX + columna * 53;
    const y = posicionY + fila * 34;

    const poligono = crearElementoSVG("polygon", {
        points: `${x},${y} ${x + 23},${y - 12} ${x + 46},${y} ${x + 23},${y + 12}`,
        class: `parking-space ${obtenerClaseEstado(espacio.estado)}`,
        "data-id": espacio.idEspacio
    });

    const texto = crearElementoSVG("text", {
        x: x + 23,
        y: y + 3,
        class: "space-text"
    });

    texto.textContent = espacio.tipoVehiculo === "MOTOCICLETA" ? "M" : "A";

    poligono.addEventListener("click", () => {
        mostrarSeleccion(espacio, poligono);
    });

    parkingSpaces.appendChild(poligono);
    parkingSpaces.appendChild(texto);
}

function actualizarFiltroVisual() {
    document.querySelectorAll(".vehicle-filter-button").forEach(boton => {
        const activo = boton.dataset.tipo === tipoVehiculoActual;

        boton.classList.toggle("active", activo);
        boton.setAttribute("aria-pressed", String(activo));
    });
}

function cerrarSeleccion() {
    if (espacioSeleccionado?.elemento) {
        espacioSeleccionado.elemento.classList.remove("space-selected");
    }

    espacioSeleccionado = null;
    selectionPanel.classList.add("hidden");
}

async function cargarDatosUsuario() {
    const [resultadoVehiculos, resultadoOcupacion] = await Promise.all([
        realizarSolicitud(`/vehiculos/${idUsuario}`),
        realizarSolicitud(`/ocupaciones/${idUsuario}`)
    ]);

    vehiculos = resultadoVehiculos || [];
    ocupacionActiva = resultadoOcupacion || null;
}

async function cargarEspacios(conservarSeleccion = false) {
    const solicitud = ++numeroSolicitud;
    const idSeleccionado = conservarSeleccion
        ? espacioSeleccionado?.espacio.idEspacio
        : null;

    mapLoading.classList.remove("hidden");
    mapError.classList.add("hidden");
    mapEmpty.classList.add("hidden");
    parkingSpaces.replaceChildren();
    cerrarSeleccion();

    try {
        const parametros = new URLSearchParams({
            tipoVehiculo: tipoVehiculoActual
        });

        const resultado = await realizarSolicitud(`/espacios?${parametros.toString()}`);

        if (solicitud !== numeroSolicitud) {
            return;
        }

        espacios = resultado || [];
        actualizarContadores();

        espacios.forEach(dibujarEspacio);

        if (espacios.length === 0) {
            mapEmpty.classList.remove("hidden");
        }

        mapLoading.classList.add("hidden");

        if (idSeleccionado !== null) {
            const espacioActualizado = espacios.find(
                espacio => Number(espacio.idEspacio) === Number(idSeleccionado)
            );

            if (espacioActualizado) {
                const elemento = parkingSpaces.querySelector(
                    `[data-id="${idSeleccionado}"]`
                );

                if (elemento) {
                    mostrarSeleccion(espacioActualizado, elemento);
                }
            }
        }
    } catch (error) {
        if (solicitud !== numeroSolicitud) {
            return;
        }

        mapLoading.classList.add("hidden");
        mapError.textContent = error.message || "No se pudieron cargar los espacios.";
        mapError.classList.remove("hidden");
    }
}

async function ocuparEspacio() {
    if (!espacioSeleccionado || procesandoOcupacion) {
        return;
    }

    const idVehiculo = Number(vehicleSelect.value);
    const idEspacio = espacioSeleccionado.espacio.idEspacio;

    if (!idVehiculo) {
        occupancyMessage.textContent = "Selecciona un vehículo.";
        return;
    }

    procesandoOcupacion = true;
    occupancyButton.disabled = true;
    occupancyButton.textContent = "Ocupando...";

    try {
        ocupacionActiva = await realizarSolicitud(`/ocupaciones/${idUsuario}`, "POST", {
            idVehiculo,
            idEspacio
        });

        await cargarEspacios(true);
    } catch (error) {
        occupancyMessage.textContent = error.message || "No se pudo ocupar el espacio.";
        occupancyButton.textContent = "Ocupar espacio";
        occupancyButton.disabled = false;
    } finally {
        procesandoOcupacion = false;
    }
}

async function liberarEspacio() {
    if (procesandoOcupacion) {
        return;
    }

    procesandoOcupacion = true;
    occupancyButton.disabled = true;
    occupancyButton.textContent = "Desocupando...";

    try {
        await realizarSolicitud(`/ocupaciones/${idUsuario}`, "DELETE");
        ocupacionActiva = null;
        await cargarEspacios(true);
    } catch (error) {
        occupancyMessage.textContent = error.message || "No se pudo desocupar el espacio.";
        occupancyButton.textContent = "Desocupar espacio";
        occupancyButton.disabled = false;
    } finally {
        procesandoOcupacion = false;
    }
}

document.querySelectorAll(".vehicle-filter-button").forEach(boton => {
    boton.addEventListener("click", () => {
        const nuevoTipo = boton.dataset.tipo;

        if (nuevoTipo === tipoVehiculoActual) {
            return;
        }

        tipoVehiculoActual = nuevoTipo;
        actualizarFiltroVisual();
        cargarEspacios();
    });
});

document.getElementById("refreshButton").addEventListener("click", cargarEspacios);

document.getElementById("closeSelection").addEventListener("click", cerrarSeleccion);

document.getElementById("logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem("usuarioControlPark");
    window.location.href = "/";
});

const botonesNavegacion = document.querySelectorAll(".nav-button");
const mapView = document.getElementById("mapView");
const viewPlaceholder = document.getElementById("viewPlaceholder");
const viewTitle = document.getElementById("viewTitle");
const placeholderTitle = document.getElementById("placeholderTitle");
const refreshButton = document.getElementById("refreshButton");

botonesNavegacion.forEach(boton => {
    boton.addEventListener("click", () => {
        botonesNavegacion.forEach(item => item.classList.remove("active"));
        boton.classList.add("active");

        const vista = boton.dataset.view;
        const esMapa = vista === "mapa";

        mapView.classList.toggle("hidden", !esMapa);
        viewPlaceholder.classList.toggle("hidden", esMapa);
        refreshButton.classList.toggle("hidden", !esMapa);

        if (esMapa) {
            viewTitle.textContent = "Estacionamiento";
        } else {
            const titulo = vista === "vehiculos" ? "Mis vehículos" : "Notificaciones";
            viewTitle.textContent = titulo;
            placeholderTitle.textContent = titulo;
        }
    });
});

async function iniciarMapa() {
    try {
        await cargarDatosUsuario();
        actualizarFiltroVisual();
        await cargarEspacios();
    } catch (error) {
        mapLoading.classList.add("hidden");
        mapError.textContent = error.message || "No se pudieron cargar los datos del usuario.";
        mapError.classList.remove("hidden");
    }
}

iniciarMapa();
