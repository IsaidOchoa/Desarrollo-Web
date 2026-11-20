
const svgNamespace = "http://www.w3.org/2000/svg";

const clasesEstado = {
    DISPONIBLE: "space-available",
    OCUPADO: "space-occupied",
    EN_REVISION: "space-review",
    FUERA_SERVICIO: "space-unavailable"
};

function crearElementoSVG(tipo, atributos = {}) {
    const elemento = document.createElementNS(svgNamespace, tipo);

    Object.entries(atributos).forEach(([nombre, valor]) => {
        elemento.setAttribute(nombre, valor);
    });

    return elemento;
}


function obtenerDimensionesEspacio(tipo, orientacion = "HORIZONTAL") {
    const dimensiones = tipo === "MOTOCICLETA"
        ? { ancho: 30, alto: 15 }
        : { ancho: 50, alto: 25 };

    if (orientacion === "VERTICAL") {
        return {
            ancho: dimensiones.alto,
            alto: dimensiones.ancho
        };
    }

    return dimensiones;
}


function obtenerClaseEstado(estado) {
    return clasesEstado[estado] || "space-unavailable";
}

function crearEspacioSVG(espacio, posicion) {
    const grupo = crearElementoSVG("g", {
        class: "parking-space",
        "data-id": espacio.idEspacio,
        "data-codigo": espacio.codigo,
        "data-tipo": espacio.tipoVehiculo
    });

    const dimensiones = obtenerDimensionesEspacio(espacio.tipoVehiculo, posicion.orientacion);

    const rectangulo = crearElementoSVG("rect", {
        x: posicion.x - dimensiones.ancho / 2,
        y: posicion.y - dimensiones.alto / 2,
        width: dimensiones.ancho,
        height: dimensiones.alto,
        rx: 2,
        class: `space-shape ${obtenerClaseEstado(espacio.estado)}`
    });

    const rotarEtiqueta = posicion.rotarEtiqueta === true;

    const etiqueta = crearElementoSVG("text", {
        x: posicion.x,
        y: posicion.y + 3,
        class: "space-label",
        "text-anchor": "middle",
        ...(rotarEtiqueta && {
            transform: `rotate(-90 ${posicion.x} ${posicion.y})`
        })
    });

    etiqueta.textContent = espacio.codigo;

    grupo.append(rectangulo, etiqueta);

    if (espacio.tipoVehiculo === "MOTOCICLETA") {
        grupo.classList.add("motorcycle-space");
    }

    return grupo;
}
function crearEtiquetaMapa(texto, x, y) {
    const etiqueta = crearElementoSVG("text", {
        x,
        y,
        class: "map-label",
        "text-anchor": "middle"
    });

    etiqueta.textContent = texto;
    return etiqueta;
}

function actualizarEspacioSVG(elemento, espacio, posicion, ocupacionActiva, esAlumno) {
    elemento.dataset.id = espacio.idEspacio;
    elemento.dataset.tipo = espacio.tipoVehiculo;

    const rectangulo = elemento.querySelector(".space-shape");
    const etiqueta = elemento.querySelector(".space-label");
    const dimensiones = obtenerDimensionesEspacio(espacio.tipoVehiculo, posicion.orientacion);

    rectangulo.setAttribute("x", posicion.x - dimensiones.ancho / 2);
    rectangulo.setAttribute("y", posicion.y - dimensiones.alto / 2);
    rectangulo.setAttribute("width", dimensiones.ancho);
    rectangulo.setAttribute("height", dimensiones.alto);
    rectangulo.setAttribute("class", `space-shape ${obtenerClaseEstado(espacio.estado)}`);

    etiqueta.setAttribute("x", posicion.x);
    etiqueta.setAttribute("y", posicion.y + 3);
    etiqueta.textContent = espacio.codigo;

    elemento.classList.toggle(
        "motorcycle-space",
        espacio.tipoVehiculo === "MOTOCICLETA"
    );

    const esMiEspacio = ocupacionActiva &&
        Number(ocupacionActiva.idEspacio) === Number(espacio.idEspacio);

    elemento.classList.toggle("my-space", Boolean(esMiEspacio));
    elemento.classList.toggle(
        "teacher-restricted",
        esAlumno && espacio.zona === "DOCENTES"
    );
}

export function sincronizarEspacios(
    espacios,
    distribucion,
    parkingSpaces,
    elementosEspacio,
    ocupacionActiva,
    esAlumno = false
) {
    const codigosActuales = new Set();

    espacios.forEach(espacio => {
        const posicion = distribucion.get(espacio.codigo);

        if (!posicion) return;

        codigosActuales.add(espacio.codigo);

        let elemento = elementosEspacio.get(espacio.codigo);

        if (!elemento) {
            elemento = crearEspacioSVG(espacio, posicion);
            parkingSpaces.appendChild(elemento);
            elementosEspacio.set(espacio.codigo, elemento);
        }

        actualizarEspacioSVG(elemento, espacio, posicion, ocupacionActiva, esAlumno);
    });

    elementosEspacio.forEach((elemento, codigo) => {
        if (!codigosActuales.has(codigo)) {
            elemento.remove();
            elementosEspacio.delete(codigo);
        }
    });
}

export function actualizarFiltroMapa(tipoVehiculo, distribucion, elementosEspacio) {
    elementosEspacio.forEach((elemento, codigo) => {
        const posicion = distribucion.get(codigo);

        elemento.style.display =
            posicion?.tipo === tipoVehiculo ? "" : "none";
    });
}

export function actualizarEstadoVisual(espacio, elementosEspacio, ocupacionActiva) {
    const elemento = elementosEspacio.get(espacio.codigo);

    if (!elemento) return;

    const rectangulo = elemento.querySelector(".space-shape");

    rectangulo.setAttribute(
        "class",
        `space-shape ${obtenerClaseEstado(espacio.estado)}`
    );

    const esMiEspacio = ocupacionActiva &&
        Number(ocupacionActiva.idEspacio) === Number(espacio.idEspacio);

    elemento.classList.toggle("my-space", Boolean(esMiEspacio));
}

function limpiarCapa(capa) {
    while (capa.firstChild) {
        capa.firstChild.remove();
    }
}

function crearRectangulo(configuracion, clase) {
    return crearElementoSVG("rect", {
        x: configuracion.x,
        y: configuracion.y,
        width: configuracion.ancho,
        height: configuracion.alto,
        rx: 5,
        class: clase
    });
}

function crearPoligono(puntos, clase) {
    return crearElementoSVG("polygon", {
        points: puntos.map(punto => punto.join(",")).join(" "),
        class: clase
    });
}

function crearFigura(configuracion, clase) {
    if (configuracion.puntos) {
        return crearPoligono(configuracion.puntos, clase);
    }

    return crearRectangulo(configuracion, clase);
}

function obtenerFiguras(configuracion) {
    return configuracion.areas || [configuracion];
}

function obtenerPosicionEtiqueta(configuracion) {
    if (configuracion.etiqueta) {
        return configuracion.etiqueta;
    }

    if (configuracion.puntos) {
        const puntos = configuracion.puntos;

        const x = puntos.reduce((suma, punto) => suma + punto[0], 0) / puntos.length;
        const y = puntos.reduce((suma, punto) => suma + punto[1], 0) / puntos.length;

        return { x, y };
    }

    return {
        x: configuracion.x + configuracion.ancho / 2,
        y: configuracion.y + 25
    };
}

function crearEtiqueta(texto, x, y, clase) {
    const etiqueta = crearElementoSVG("text", {
        x,
        y,
        class: clase,
        "text-anchor": "middle"
    });

    etiqueta.textContent = texto;
    return etiqueta;
}

export function renderizarInfraestructura(configuracion) {
    console.log("Configuración recibida:", configuracion);
    console.log("Ancho:", configuracion.ancho);
    console.log("Alto:", configuracion.alto);

    const terrenoLayer = document.getElementById("terrainLayer");
    const zonasLayer = document.getElementById("roadsLayer");
    const edificiosLayer = document.getElementById("buildingsLayer");
    const etiquetasLayer = document.getElementById("labelsLayer");
    const labelsLayer = document.getElementById("labelsLayer");

    if (!terrenoLayer || !zonasLayer || !edificiosLayer || !etiquetasLayer) {
        console.error("No se encontraron todas las capas del mapa.");
        return;
    }

    limpiarCapa(terrenoLayer);
    limpiarCapa(zonasLayer);
    limpiarCapa(edificiosLayer);
    limpiarCapa(etiquetasLayer);

    etiquetasLayer.appendChild(
        crearEtiquetaMapa("SALIDA / ENTRADA", 580, 890)
    );

    // Terreno general
    terrenoLayer.appendChild(crearRectangulo({
        x: 30,
        y: 30,
        ancho: configuracion.ancho - 60,
        alto: configuracion.alto - 60
    }, "terrain-top"));

    // Zonas de estacionamiento
    Object.entries(configuracion.zonas).forEach(([clave, zona]) => {
        obtenerFiguras(zona).forEach(area => {
            zonasLayer.appendChild(
                crearFigura(area, `parking-zone zone-${clave}`)
            );
        });

        const posicion = obtenerPosicionEtiqueta(zona);

        etiquetasLayer.appendChild(crearEtiqueta(
            zona.nombre,
            posicion.x,
            posicion.y,
            "map-label zone-label"
        ));
    });

    // Edificios
    Object.entries(configuracion.edificios).forEach(([clave, edificio]) => {
        obtenerFiguras(edificio).forEach(area => {
            edificiosLayer.appendChild(
                crearFigura(area, `building building-${clave}`)
            );
        });

        const posicion = obtenerPosicionEtiqueta(edificio);

        etiquetasLayer.appendChild(crearEtiqueta(
            edificio.nombre,
            posicion.x,
            posicion.y,
            "map-label building-label"
        ));
    });
}