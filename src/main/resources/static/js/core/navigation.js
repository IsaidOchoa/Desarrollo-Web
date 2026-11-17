
export function inicializarNavegacion() {
    const botones = document.querySelectorAll(".nav-button");

    const vistas = {
        map: document.getElementById("mapView"),
        vehicles: document.getElementById("vehiclesView"),
        notifications: document.getElementById("notificationsView")
    };

    const titulos = {
        map: [
            "Mapa del estacionamiento",
            "Consulta la disponibilidad de los espacios."
        ],
        vehicles: [
            "Mis vehículos",
            "Consulta tus vehículos registrados."
        ],
        notifications: [
            "Notificaciones",
            "Consulta los avisos del sistema."
        ]
    };

    const pageTitle = document.getElementById("pageTitle");
    const pageDescription = document.getElementById("pageDescription");
    const refreshButton = document.getElementById("refreshButton");

    function cambiarVista(vista) {
        if (!vistas[vista]) {
            return;
        }

        botones.forEach(boton => {
            boton.classList.toggle("active", boton.dataset.view === vista);
        });

        Object.entries(vistas).forEach(([nombre, elemento]) => {
            elemento.classList.toggle("hidden", nombre !== vista);
        });

        pageTitle.textContent = titulos[vista][0];
        pageDescription.textContent = titulos[vista][1];

        refreshButton.classList.toggle("hidden", vista !== "map");
    }

    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            cambiarVista(boton.dataset.view);
        });
    });
}
