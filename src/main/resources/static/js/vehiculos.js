
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

        if (mostrar) {
            selectorTipo.focus();
        } else {
            formulario.reset();
            limpiarMensaje();
        }
    }

    function crearTarjeta(vehiculo) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "vehicle-card";

        const icono = document.createElement("div");
        icono.className = "vehicle-icon";
        icono.textContent = vehiculo.tipo === "MOTOCICLETA" ? "M" : "A";

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
        tarjeta.append(icono, informacion);

        return tarjeta;
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
        botonGuardar.textContent = "Guardando...";

        try {
            await realizarSolicitud(
                `/vehiculos/${idUsuario}`,
                "POST",
                { tipo, placas }
            );

            mostrarFormulario(false);
            await cargarVehiculos(false);
            mostrarMensaje("Vehículo registrado correctamente.", "success");
        } catch (error) {
            mostrarMensaje(
                error.message || "No fue posible registrar el vehículo.",
                "error"
            );
        } finally {
            botonGuardar.disabled = false;
            botonGuardar.textContent = "Guardar vehículo";
        }
    });

    cargarVehiculos();
}
