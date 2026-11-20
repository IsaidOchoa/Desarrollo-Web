
import { realizarSolicitud } from "./apiModule.js";

const formularioLogin = document.getElementById("loginForm");
const mensajeLogin = document.getElementById("loginMessage");
const botonLogin = document.getElementById("loginButton");

formularioLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const password = document.getElementById("password").value;

    mensajeLogin.textContent = "";
    botonLogin.disabled = true;
    botonLogin.textContent = "Ingresando...";

    try {
        const usuario = await realizarSolicitud("/auth/login", "POST", {
            correo,
            password
        });

        sessionStorage.setItem("usuarioControlPark", JSON.stringify(usuario));
        window.location.href = "/mapa.html";
    } catch (error) {
        mensajeLogin.style.color = "#c0392b";
        mensajeLogin.textContent = error.message || "Correo o contraseña incorrectos.";
    } finally {
        botonLogin.disabled = false;
        botonLogin.textContent = "Iniciar sesión";
    }
});
