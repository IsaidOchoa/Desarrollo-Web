
import { verificarSesion, cerrarSesion } from "./core/session.js";
import { inicializarMapa } from "./mapa/mapa.js";
import { inicializarVehiculos } from "./vehiculos.js";
import {
    inicializarNotificaciones,
    cargarNotificaciones
} from "./notificaciones.js";

const usuario = verificarSesion();

if (usuario) {
    document.getElementById("userEmail").textContent = usuario.correo || "";

    document.getElementById("userRole").textContent = {
        ALUMNO: "Estudiante",
        DOCENTE: "Docente",
        ADMINISTRADOR: "Administrador"
    }[usuario.rol] || usuario.rol || "";

    document.getElementById("logoutButton").addEventListener("click", cerrarSesion);

    inicializarMapa(usuario);
    inicializarVehiculos(usuario);
    inicializarNotificaciones(usuario);

    inicializarPaneles();
}


function inicializarPaneles() {
    const herramientas = document.querySelector(".map-tools");
    const panel = document.getElementById("sidePanel");
    const titulo = document.getElementById("sidePanelTitle");

    const botonNotificaciones = document.getElementById("notificationsToggle");
    const botonVehiculos = document.getElementById("vehiclesToggle");
    const botonCerrar = document.getElementById("closeSidePanelButton");

    const vistaNotificaciones = document.getElementById("notificationsView");
    const vistaVehiculos = document.getElementById("vehiclesView");

    let panelActivo = null;

    function cerrarPanel() {
    panelActivo = null;
    herramientas.classList.remove("open");

    vistaNotificaciones.classList.add("hidden");
    vistaVehiculos.classList.add("hidden");

    botonNotificaciones.classList.remove("active");
    botonVehiculos.classList.remove("active");

    botonNotificaciones.setAttribute("aria-expanded", "false");
    botonVehiculos.setAttribute("aria-expanded", "false");
}

    async function abrirPanel(tipo) {
        if (panelActivo === tipo) {
            cerrarPanel();
            return;
        }

        panelActivo = tipo;

        vistaNotificaciones.classList.toggle("hidden", tipo !== "notifications");
        vistaVehiculos.classList.toggle("hidden", tipo !== "vehicles");

        titulo.textContent = tipo === "notifications"
            ? "Notificaciones"
            : "Mis vehículos";

        herramientas.classList.add("open");

        botonNotificaciones.classList.toggle("active", tipo === "notifications");
        botonVehiculos.classList.toggle("active", tipo === "vehicles");

        botonNotificaciones.setAttribute(
            "aria-expanded",
            String(tipo === "notifications")
        );

        botonVehiculos.setAttribute(
            "aria-expanded",
            String(tipo === "vehicles")
        );

        if (tipo === "notifications") {
            await cargarNotificaciones();
        }
    }

    botonNotificaciones.addEventListener("click", () => {
        abrirPanel("notifications");
    });

    botonVehiculos.addEventListener("click", () => {
        abrirPanel("vehicles");
    });

    botonCerrar.addEventListener("click", cerrarPanel);

    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape" && panelActivo) {
            cerrarPanel();
        }
    });
}

