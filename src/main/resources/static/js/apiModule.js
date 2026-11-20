
const API_URL = "/api";

export async function realizarSolicitud(endpoint, metodo = "GET", datos = null) {
    const opciones = {
        method: metodo,
        headers: {
            "Content-Type": "application/json"
        }
    };

    if (datos !== null) {
        opciones.body = JSON.stringify(datos);
    }

    const respuesta = await fetch(`${API_URL}${endpoint}`, opciones);
    let resultado = null;

    if (respuesta.status !== 204) {
        resultado = await respuesta.json();
    }

    if (!respuesta.ok) {
        throw new Error(
            resultado?.message ||
            resultado?.mensaje ||
            "No fue posible completar la solicitud."
        );
    }

    return resultado;
}
