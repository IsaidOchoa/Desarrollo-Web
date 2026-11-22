
import { realizarSolicitud } from "./apiModule.js";

export function inicializarVehiculos(usuario) {
    const formulario = document.getElementById("vehicleForm");
    const botonAgregar = document.getElementById("addVehicleButton");
    const botonCancelar = document.getElementById("cancelVehicleButton");
    const botonGuardar = document.getElementById("saveVehicleButton");
    const selectorTipo = document.getElementById("vehicleType");
    const campoPlacas = document.getElementById("vehiclePlates");
    const listaVehiculos = document.getElementById("vehiclesList");
    const mensaje = document.getElementById("vehicleMessage");

    const idUsuario = usuario?.idUsuario;
    let vehiculoEnEdicion = null;

    if (!idUsuario) {
        mostrarMensaje("No se pudo identificar al usuario de la sesión.", "error");
        return;
    }

    function mostrarMensaje(texto, tipo = "info") {
        mensaje.textContent = texto;
        mensaje.className = `vehicle-message ${tipo}`;
    }

    function limpiarMensaje() {
        mensaje.textContent = "";
        mensaje.className = "vehicle-message";
    }

    function mostrarFormulario(mostrar) {
        formulario.classList.toggle("hidden", !mostrar);
        botonAgregar.classList.toggle("hidden", mostrar);

        if (!mostrar) {
            formulario.reset();
            selectorTipo.disabled = false;
            vehiculoEnEdicion = null;
            botonGuardar.textContent = "Guardar vehículo";
            limpiarMensaje();
            return;
        }

        if (vehiculoEnEdicion) {
            campoPlacas.focus();
        } else {
            selectorTipo.focus();
        }
    }

    function crearTarjeta(vehiculo) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "vehicle-card";

        const icono = vehiculo.tipo === "MOTOCICLETA"
            ? "fa-motorcycle"
            : "fa-car";

        const iconoVehiculo = document.createElement("i");
        iconoVehiculo.className = `fa-solid ${icono} vehicle-card-icon`;
        iconoVehiculo.setAttribute("aria-hidden", "true");

        const informacion = document.createElement("div");
        informacion.className = "vehicle-information";

        const tipo = document.createElement("span");
        tipo.className = "vehicle-type";
        tipo.textContent = vehiculo.tipo === "MOTOCICLETA"
            ? "Motocicleta"
            : "Automóvil";

        const placas = document.createElement("h4");
        placas.textContent = vehiculo.placas;

        informacion.append(tipo, placas);

        const acciones = document.createElement("div");
        acciones.className = "vehicle-card-actions";

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.className = "vehicle-action-button edit-vehicle-button";
        botonEditar.setAttribute("aria-label", "Editar vehículo");
        botonEditar.title = "Editar vehículo";
        botonEditar.innerHTML = '<i class="fa-solid fa-pen" aria-hidden="true"></i>';

        botonEditar.addEventListener("click", () => {
            editarVehiculo(vehiculo);
        });

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "vehicle-action-button delete-vehicle-button";
        botonEliminar.setAttribute("aria-label", "Eliminar vehículo");
        botonEliminar.title = "Eliminar vehículo";
        botonEliminar.innerHTML = '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';

        botonEliminar.addEventListener("click", () => {
            eliminarVehiculo(vehiculo, botonEliminar);
        });

        acciones.append(botonEditar, botonEliminar);
        tarjeta.append(iconoVehiculo, informacion, acciones);

        return tarjeta;
    }

    function editarVehiculo(vehiculo) {
        vehiculoEnEdicion = vehiculo;

        selectorTipo.value = vehiculo.tipo;
        campoPlacas.value = vehiculo.placas;

        selectorTipo.disabled = true;
        botonGuardar.textContent = "Guardar cambios";

        mostrarFormulario(true);
        limpiarMensaje();
    }

    async function eliminarVehiculo(vehiculo, boton) {
        const confirmar = confirm(
            `¿Deseas eliminar el vehículo con placas ${vehiculo.placas}?`
        );

        if (!confirmar) return;

        boton.disabled = true;

        try {
            await realizarSolicitud(
                `/vehiculos/${idUsuario}/${vehiculo.idVehiculo}`,
                "DELETE"
            );

            if (vehiculoEnEdicion?.idVehiculo === vehiculo.idVehiculo) {
                mostrarFormulario(false);
            }

            await cargarVehiculos(false);
            mostrarMensaje("Vehículo eliminado correctamente.", "success");
        } catch (error) {
            mostrarMensaje(
                error.message || "No fue posible eliminar el vehículo.",
                "error"
            );
            boton.disabled = false;
        }
    }

    function renderizarVehiculos(vehiculos) {
        listaVehiculos.replaceChildren();

        if (!vehiculos.length) {
            const vacio = document.createElement("div");
            vacio.className = "vehicles-empty";
            vacio.textContent = "Todavía no tienes vehículos registrados.";
            listaVehiculos.appendChild(vacio);
            return;
        }

        vehiculos.forEach(vehiculo => {
            listaVehiculos.appendChild(crearTarjeta(vehiculo));
        });
    }

    async function cargarVehiculos(mostrarCarga = true) {
        if (mostrarCarga) {
            listaVehiculos.replaceChildren();
            mostrarMensaje("Cargando vehículos...");
        }

        try {
            const vehiculos = await realizarSolicitud(
                `/vehiculos/${idUsuario}`
            );

            renderizarVehiculos(
                Array.isArray(vehiculos) ? vehiculos : []
            );

            if (mostrarCarga) limpiarMensaje();
        } catch (error) {
            listaVehiculos.replaceChildren();
            mostrarMensaje(
                error.message || "No fue posible consultar tus vehículos.",
                "error"
            );
        }
    }

    botonAgregar.addEventListener("click", () => {
        vehiculoEnEdicion = null;
        selectorTipo.disabled = false;
        formulario.reset();
        botonGuardar.textContent = "Guardar vehículo";
        limpiarMensaje();
        mostrarFormulario(true);
    });

    botonCancelar.addEventListener("click", () => {
        mostrarFormulario(false);
    });

    formulario.addEventListener("submit", async evento => {
        evento.preventDefault();
        limpiarMensaje();

        const tipo = selectorTipo.value;
        const placas = campoPlacas.value.trim().toUpperCase();

        if (!tipo || !placas) {
            mostrarMensaje("Completa todos los campos.", "error");
            return;
        }

        botonGuardar.disabled = true;
        botonGuardar.textContent = vehiculoEnEdicion
            ? "Guardando cambios..."
            : "Guardando...";

        try {
            if (vehiculoEnEdicion) {
                await realizarSolicitud(
                    `/vehiculos/${idUsuario}/${vehiculoEnEdicion.idVehiculo}`,
                    "PUT",
                    { tipo, placas }
                );

                mostrarFormulario(false);
                await cargarVehiculos(false);
                mostrarMensaje("Vehículo actualizado correctamente.", "success");
            } else {
                await realizarSolicitud(
                    `/vehiculos/${idUsuario}`,
                    "POST",
                    { tipo, placas }
                );

                mostrarFormulario(false);
                await cargarVehiculos(false);
                mostrarMensaje("Vehículo registrado correctamente.", "success");
            }
        } catch (error) {
            mostrarMensaje(
                error.message || "No fue posible guardar el vehículo.",
                "error"
            );
        } finally {
            botonGuardar.disabled = false;
            botonGuardar.textContent = vehiculoEnEdicion
                ? "Guardar cambios"
                : "Guardar vehículo";
        }
    });

    cargarVehiculos();
}
