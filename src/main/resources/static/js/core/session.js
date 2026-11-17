
export function obtenerUsuario() {
    try {
        return JSON.parse(sessionStorage.getItem("usuarioControlPark") || "null");
    } catch {
        return null;
    }
}

export function verificarSesion() {
    const usuario = obtenerUsuario();

    if (!usuario) {
        window.location.href = "/";
        return null;
    }

    return usuario;
}

export function cerrarSesion() {
    sessionStorage.removeItem("usuarioControlPark");
    window.location.href = "/";
}
