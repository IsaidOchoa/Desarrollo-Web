
import { realizarSolicitud } from "./apiModule.js";

let usuarioActual = null;
let inicializado = false;

export function inicializarNotificaciones(usuario) {
    usuarioActual = usuario;

    if (inicializado) return;
    inicializado = true;

    cargarNotificaciones();
}

export async function cargarNotificaciones() {
    const lista = document.getElementById("notificationsList");

    if (!usuarioActual || !lista) return;

    lista.innerHTML = `
        <p class="notifications-loading">
            Cargando notificaciones...
        </p>
    `;

    try {
        const notificaciones = await realizarSolicitud(
            `/notificaciones/${usuarioActual.idUsuario}`
        );

        renderizarNotificaciones(notificaciones);
    } catch (error) {
        lista.innerHTML = `
            <div class="notifications-empty">
                <p>No fue posible cargar las notificaciones.</p>
                <p>${escaparHTML(error.message)}</p>
            </div>
        `;
    }
}

function renderizarNotificaciones(notificaciones) {
    const lista = document.getElementById("notificationsList");

    if (!notificaciones.length) {
        lista.innerHTML = `
            <div class="notifications-empty">
                <p>No tienes notificaciones.</p>
                <span>Los avisos del sistema aparecerán aquí.</span>
            </div>
        `;
        return;
    }

    const esAdministrador = usuarioActual.rol === "ADMINISTRADOR";

    lista.innerHTML = notificaciones.map(notificacion => {
        const requiereRespuesta =
            !esAdministrador &&
            notificacion.tipo === "CONFIRMAR_OCUPACION" &&
            notificacion.estado === "PENDIENTE";

        const requiereLiberacion =
            esAdministrador &&
            notificacion.tipo === "OCUPACION_EN_REVISION" &&
            notificacion.estado === "PENDIENTE" &&
            notificacion.idOcupacion != null;

        const iconos = {
            CONFIRMAR_OCUPACION: "⏰",
            OCUPACION_EN_REVISION: "⚠",
            ESPACIO_LIBERADO: "✓"
        };

        const nombres = {
            CONFIRMAR_OCUPACION: "Confirmación de ocupación",
            OCUPACION_EN_REVISION: "Ocupación en revisión",
            ESPACIO_LIBERADO: "Espacio liberado"
        };

        return `
            <article class="notification-card ${
                requiereRespuesta || requiereLiberacion
                    ? "notification-action"
                    : ""
            }">
                <div class="notification-icon">
                    ${iconos[notificacion.tipo] || "●"}
                </div>

                <div class="notification-content">
                    <div class="notification-title">
                        <h3>
                            ${nombres[notificacion.tipo] || "Notificación"}
                        </h3>

                        <span class="notification-status status-${notificacion.estado.toLowerCase()}">
                            ${obtenerNombreEstado(notificacion.estado)}
                        </span>
                    </div>

                    <p>${escaparHTML(notificacion.mensaje)}</p>

                    <span class="notification-date">
                        ${formatearFecha(notificacion.fechaCreacion)}
                    </span>

                    ${requiereRespuesta ? `
                        <div class="notification-actions">
                            <button
                                class="primary-button"
                                data-id="${notificacion.idNotificacion}"
                                data-continuar="true">
                                Seguir ocupando
                            </button>

                            <button
                                class="secondary-button"
                                data-id="${notificacion.idNotificacion}"
                                data-continuar="false">
                                Liberar espacio
                            </button>
                        </div>
                    ` : ""}

                    ${requiereLiberacion ? `
                        <div class="notification-actions">
                            <button
                                class="primary-button"
                                data-ocupacion="${notificacion.idOcupacion}"
                                data-accion="liberar">
                                Liberar espacio
                            </button>
                        </div>
                    ` : ""}
                </div>
            </article>
        `;
    }).join("");

    lista.querySelectorAll("[data-continuar]").forEach(boton => {
        boton.addEventListener("click", responderNotificacion);
    });

    lista.querySelectorAll('[data-accion="liberar"]').forEach(boton => {
        boton.addEventListener("click", liberarDesdeAdministrador);
    });
}

async function responderNotificacion(evento) {
    const boton = evento.currentTarget;
    const idNotificacion = boton.dataset.id;
    const continuarOcupando = boton.dataset.continuar === "true";

    const botones = boton.closest(".notification-actions")
        .querySelectorAll("button");

    botones.forEach(b => b.disabled = true);

    try {
        await realizarSolicitud(
            `/notificaciones/${usuarioActual.idUsuario}/${idNotificacion}/respuesta`,
            "POST",
            { continuarOcupando }
        );

        await cargarNotificaciones();
    } catch (error) {
        alert(error.message);
        botones.forEach(b => b.disabled = false);
    }
}

async function liberarDesdeAdministrador(evento) {
    const boton = evento.currentTarget;
    const idOcupacion = boton.dataset.ocupacion;

    if (!confirm("¿Deseas liberar este espacio de estacionamiento?")) {
        return;
    }

    boton.disabled = true;

    try {
        await realizarSolicitud(
            `/admin/ocupaciones/${idOcupacion}/liberar`,
            "PUT"
        );

        await cargarNotificaciones();
    } catch (error) {
        alert(error.message);
        boton.disabled = false;
    }
}

function obtenerNombreEstado(estado) {
    const nombres = {
        PENDIENTE: "Pendiente",
        ATENDIDA: "Atendida",
        EXPIRADA: "Expirada"
    };

    return nombres[estado] || estado;
}

function formatearFecha(fecha) {
    const fechaLocal = new Date(fecha);

    if (Number.isNaN(fechaLocal.getTime())) return fecha;

    return fechaLocal.toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caracter]);
}
