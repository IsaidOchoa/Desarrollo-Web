
import {
    verificarSesion,
    cerrarSesion
} from "./core/session.js";

import { inicializarNavegacion } from "./core/navigation.js";
import { inicializarMapa } from "./mapa/mapa.js";
import { inicializarVehiculos } from "./vehiculos.js";

const usuario = verificarSesion();

if (usuario) {
    document.getElementById("userEmail").textContent =
        usuario.correo || "";

    document.getElementById("userRole").textContent = {
        ALUMNO: "Estudiante",
        DOCENTE: "Docente",
        ADMINISTRADOR: "Administrador"
    }[usuario.rol] || usuario.rol || "";

    document.getElementById("logoutButton").addEventListener(
        "click",
        cerrarSesion
    );

    inicializarNavegacion();
    inicializarMapa(usuario);
    inicializarVehiculos(usuario);
}
