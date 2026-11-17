import { realizarSolicitud } from "../apiModule.js";
import {
    obtenerDistribucionMapa,
    obtenerConfiguracionMapa
} from "./distribucionMapa.js";

import {
    sincronizarEspacios,
    actualizarFiltroMapa,
    renderizarInfraestructura
} from "./mapaRenderer.js";

export function inicializarMapa(usuario) {
    const parkingSpaces = document.getElementById("parkingSpaces");
    const mapScene = document.getElementById("mapScene");
    const mapLoading = document.getElementById("mapLoading");
    const mapError = document.getElementById("mapError");
    const mapEmpty = document.getElementById("mapEmpty");
    const selectionPanel = document.getElementById("selectionPanel");
    const occupancyActions = document.getElementById("occupancyActions");
    const occupancyMessage = document.getElementById("occupancyMessage");

    const configuracionMapa = obtenerConfiguracionMapa();
    const distribucionMapa = obtenerDistribucionMapa();
    console.table(
    ["G-01", "D-01"].map(codigo => {
        const posicion = distribucionMapa.get(codigo);

        return {
            codigo,
            x: posicion?.x,
            y: posicion?.y,
            orientacion: posicion?.orientacion
        };
    })
);
    const elementosEspacio = new Map();

    console.log("Configuración utilizada por mapa.js:", configuracionMapa);
    renderizarInfraestructura(configuracionMapa);

    const idUsuario = usuario.idUsuario;

    let espacios = [];
    let vehiculos = [];
    let ocupacionActiva = null;
    let espacioSeleccionado = null;
    let elementoSeleccionado = null;
    let tipoVehiculoActual = "AUTOMOVIL";
    let anguloMapa = 0;
    let procesandoOcupacion = false;

    const etiquetasEstado = {
        DISPONIBLE: "Disponible",
        OCUPADO: "Ocupado",
        EN_REVISION: "En revisión",
        FUERA_SERVICIO: "Fuera de servicio"
    };

    function obtenerNombreEstado(estado) {
        return etiquetasEstado[estado] || "Desconocido";
    }

    function obtenerNombreTipo(tipo) {
        return tipo === "MOTOCICLETA" ? "Motocicleta" : "Automóvil";
    }

    function obtenerNombreZona(zona) {
        return zona === "DOCENTES" ? "Docentes" : "General";
    }

    function actualizarContadores() {
        const espaciosFiltrados = espacios.filter(
            espacio => espacio.tipoVehiculo === tipoVehiculoActual
        );

        const total = espaciosFiltrados.length;

        const disponibles = espaciosFiltrados.filter(
            espacio => espacio.estado === "DISPONIBLE"
        ).length;

        const ocupados = espaciosFiltrados.filter(
            espacio => espacio.estado === "OCUPADO"
        ).length;

        const revision = espaciosFiltrados.filter(
            espacio => espacio.estado === "EN_REVISION"
        ).length;

        const fueraServicio = espaciosFiltrados.filter(
            espacio => espacio.estado === "FUERA_SERVICIO"
        ).length;

        document.getElementById("availableCount").textContent = disponibles;
        document.getElementById("occupiedCount").textContent = ocupados;
        document.getElementById("reviewCount").textContent = revision;
        document.getElementById("outOfServiceCount").textContent = fueraServicio;
        document.getElementById("availabilityTotal").textContent = `${total} espacios`;

        const porcentaje = cantidad =>
            total ? `${cantidad / total * 100}%` : "0%";

        document.getElementById("availableBar").style.width = porcentaje(disponibles);
        document.getElementById("occupiedBar").style.width = porcentaje(ocupados);
        document.getElementById("reviewBar").style.width = porcentaje(revision);
        document.getElementById("outOfServiceBar").style.width = porcentaje(fueraServicio);
    }

    function actualizarVisibilidadFiltro() {
        actualizarFiltroMapa(
            tipoVehiculoActual,
            distribucionMapa,
            elementosEspacio
        );

        actualizarContadores();
    }

    function mostrarSeleccion(espacio, elemento) {
        if (elementoSeleccionado) {
            elementoSeleccionado.classList.remove("space-selected");
        }

        espacioSeleccionado = espacio;
        elementoSeleccionado = elemento;

        elemento.classList.add("space-selected");
        selectionPanel.classList.remove("hidden");

        document.getElementById("selectedCode").textContent = espacio.codigo;
        document.getElementById("selectedZone").textContent =
            obtenerNombreZona(espacio.zona);
        document.getElementById("selectedType").textContent =
            obtenerNombreTipo(espacio.tipoVehiculo);
        document.getElementById("selectedStatus").textContent =
            obtenerNombreEstado(espacio.estado);

        actualizarAcciones(espacio);
    }

    function actualizarAcciones(espacio) {
        occupancyActions.replaceChildren();
        occupancyMessage.textContent = "";

        const esMiEspacio = ocupacionActiva &&
            Number(ocupacionActiva.idEspacio) === Number(espacio.idEspacio);

        if (esMiEspacio) {
            const botonLiberar = document.createElement("button");
            botonLiberar.type = "button";
            botonLiberar.className = "occupancy-button release-button";
            botonLiberar.textContent = "Desocupar espacio";
            botonLiberar.disabled = procesandoOcupacion;
            botonLiberar.addEventListener("click", liberarEspacio);

            occupancyActions.appendChild(botonLiberar);

            occupancyMessage.textContent =
                "Este espacio está asociado a tu ocupación activa.";

            return;
        }

        if (ocupacionActiva) {
            occupancyMessage.textContent =
                "Ya tienes una ocupación activa. Debes liberar tu espacio actual antes de ocupar otro.";
            return;
        }

        if (espacio.estado !== "DISPONIBLE") {
            occupancyMessage.textContent =
                "Este espacio no está disponible para ocupar.";
            return;
        }

        const vehiculosCompatibles = vehiculos.filter(
            vehiculo => vehiculo.tipo === espacio.tipoVehiculo
        );

        if (!vehiculosCompatibles.length) {
            occupancyMessage.textContent =
                "No tienes vehículos registrados compatibles con este espacio.";
            return;
        }

        const etiquetaVehiculo = document.createElement("label");
        etiquetaVehiculo.className = "vehicle-select-label";
        etiquetaVehiculo.textContent = "Selecciona tu vehículo";

        const selector = document.createElement("select");
        selector.id = "vehicleSelect";

        vehiculosCompatibles.forEach(vehiculo => {
            const opcion = document.createElement("option");
            opcion.value = vehiculo.idVehiculo;
            opcion.textContent = vehiculo.placas ||
                `Vehículo ${vehiculo.idVehiculo}`;

            selector.appendChild(opcion);
        });

        const botonOcupar = document.createElement("button");
        botonOcupar.type = "button";
        botonOcupar.className = "occupancy-button occupy-button";
        botonOcupar.textContent = "Ocupar espacio";
        botonOcupar.disabled = procesandoOcupacion;
        botonOcupar.addEventListener("click", ocuparEspacio);

        occupancyActions.append(
            etiquetaVehiculo,
            selector,
            botonOcupar
        );
    }

    function cerrarSeleccion() {
        if (elementoSeleccionado) {
            elementoSeleccionado.classList.remove("space-selected");
        }

        espacioSeleccionado = null;
        elementoSeleccionado = null;

        selectionPanel.classList.add("hidden");
        occupancyActions.replaceChildren();
        occupancyMessage.textContent = "";
    }

    async function cargarDatosUsuario() {
        const resultados = await Promise.all([
            realizarSolicitud(`/vehiculos/${idUsuario}`),
            realizarSolicitud(`/ocupaciones/${idUsuario}`)
        ]);

        vehiculos = resultados[0] || [];
        ocupacionActiva = resultados[1] || null;
    }

    async function cargarEspacios(conservarSeleccion = false) {
        const codigoSeleccionado = conservarSeleccion
            ? espacioSeleccionado?.codigo
            : null;

        mapLoading.classList.remove("hidden");
        mapError.classList.add("hidden");
        mapEmpty.classList.add("hidden");

        try {
            const resultado = await realizarSolicitud("/espacios");
            espacios = resultado || [];

            sincronizarEspacios(
                espacios,
                distribucionMapa,
                parkingSpaces,
                elementosEspacio,
                ocupacionActiva
            );

            actualizarVisibilidadFiltro();

            if (!espacios.length) {
                mapEmpty.classList.remove("hidden");
            }

            if (codigoSeleccionado) {
                const espacioActualizado = espacios.find(
                    espacio => espacio.codigo === codigoSeleccionado
                );

                const elementoActualizado =
                    elementosEspacio.get(codigoSeleccionado);

                if (espacioActualizado && elementoActualizado) {
                    mostrarSeleccion(
                        espacioActualizado,
                        elementoActualizado
                    );
                } else {
                    cerrarSeleccion();
                }
            } else {
                cerrarSeleccion();
            }
        } catch (error) {
            mapError.textContent =
                error.message || "No fue posible cargar los espacios.";
            mapError.classList.remove("hidden");
        } finally {
            mapLoading.classList.add("hidden");
        }
    }

    async function ocuparEspacio() {
        if (!espacioSeleccionado || procesandoOcupacion) {
            return;
        }

        const selector = document.getElementById("vehicleSelect");

        if (!selector) {
            return;
        }

        procesandoOcupacion = true;
        actualizarAcciones(espacioSeleccionado);

        try {
            await realizarSolicitud(`/ocupaciones/${idUsuario}`, "POST", {
                idVehiculo: Number(selector.value),
                idEspacio: Number(espacioSeleccionado.idEspacio)
            });

            await cargarDatosUsuario();
            await cargarEspacios(true);
        } catch (error) {
            occupancyMessage.textContent =
                error.message || "No fue posible ocupar el espacio.";
        } finally {
            procesandoOcupacion = false;

            if (espacioSeleccionado) {
                actualizarAcciones(espacioSeleccionado);
            }
        }
    }

    async function liberarEspacio() {
        if (procesandoOcupacion) {
            return;
        }

        procesandoOcupacion = true;

        try {
            await realizarSolicitud(`/ocupaciones/${idUsuario}`, "DELETE");

            await cargarDatosUsuario();
            await cargarEspacios(true);
        } catch (error) {
            occupancyMessage.textContent =
                error.message || "No fue posible liberar el espacio.";
        } finally {
            procesandoOcupacion = false;

            if (espacioSeleccionado) {
                actualizarAcciones(espacioSeleccionado);
            }
        }
    }

    function actualizarFiltroVisual() {
        document.querySelectorAll(".filter-button").forEach(boton => {
            boton.classList.toggle(
                "active",
                boton.dataset.tipo === tipoVehiculoActual
            );
        });

        actualizarVisibilidadFiltro();
        cerrarSeleccion();
    }

    function girarMapa(grados) {
        anguloMapa = (anguloMapa + grados) % 360;
        mapScene.setAttribute(
            "transform",
            `rotate(${anguloMapa} 600 380)`
        );
    }

    function restablecerRotacion() {
        anguloMapa = 0;
        mapScene.setAttribute("transform", "rotate(0 600 380)");
    }

    parkingSpaces.addEventListener("click", evento => {
        const elemento = evento.target.closest(".parking-space");

        if (!elemento || !parkingSpaces.contains(elemento)) {
            return;
        }

        const codigo = elemento.dataset.codigo;
        const espacio = espacios.find(
            elemento => elemento.codigo === codigo
        );

        if (espacio) {
            mostrarSeleccion(espacio, elemento);
        }
    });

    document.querySelectorAll(".filter-button").forEach(boton => {
        boton.addEventListener("click", () => {
            tipoVehiculoActual = boton.dataset.tipo;
            actualizarFiltroVisual();
        });
    });

    document.getElementById("refreshButton").addEventListener(
        "click",
        async () => {
            try {
                await cargarDatosUsuario();
                await cargarEspacios(true);
            } catch (error) {
                mapError.textContent =
                    error.message || "No fue posible actualizar los datos.";
                mapError.classList.remove("hidden");
            }
        }
    );

    document.getElementById("closeSelectionButton").addEventListener(
        "click",
        cerrarSeleccion
    );

    document.getElementById("rotateLeftButton").addEventListener(
        "click",
        () => girarMapa(-15)
    );

    document.getElementById("rotateRightButton").addEventListener(
        "click",
        () => girarMapa(15)
    );

    document.getElementById("resetRotationButton").addEventListener(
        "click",
        restablecerRotacion
    );

    async function iniciar() {
        try {
            await cargarDatosUsuario();
            await cargarEspacios();
        } catch (error) {
            mapLoading.classList.add("hidden");
            mapError.textContent =
                error.message || "No fue posible iniciar el mapa.";
            mapError.classList.remove("hidden");
        }
    }

    iniciar();
}
