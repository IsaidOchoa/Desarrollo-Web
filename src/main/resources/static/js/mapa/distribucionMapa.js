
const MAPA = {
    ancho: 1200,
    alto: 900,

    zonas: {
        general: {
            nombre: "GENERAL",
            etiqueta: { x: 500, y: 170 },
            areas: [
                {
                    puntos: [
                        [70, 100],
                        [640, 100],
                        [640, 850],
                        [500, 850],
                        [500, 230],
                        [70, 230]
                    ]
                }
            ]
        },

        docentes: {
            nombre: "DOCENTES",
            etiqueta: { x: 890, y: 700 },
            areas: [
                {
                    x: 650,
                    y: 590,
                    ancho: 500,
                    alto: 210
                }
            ]
        },

        motocicletas: {
            nombre: "MOTOS",
            etiqueta: { x: 570, y: 280 },
            areas: [
                {
                    puntos: [
                        [380, 190],
                        [540, 190],
                        [540, 340],
                        [500, 340],
                        [500, 230],
                        [380, 230]
                    ]
                },
                {
                    puntos: [
                        [600, 340],
                        [640, 340],
                        [640, 220],
                        [600, 220]
                    ]
                }
            ]
        }
    },

    edificios: {
        areaComun: {
            nombre: "ÁREA COMÚN",
            x: 50,
            y: 240,
            ancho: 440,
            alto: 610
        },
        edificioA: {
            nombre: "EDIFICIO A",
            x: 650,
            y: 50,
            ancho: 500,
            alto: 530
        },
        cancha: {
            nombre: "CANCHA",
            x: 650,
            y: 810,
            ancho: 500,
            alto: 40
        },
        muro: {
            nombre: "MURO",
            x: 50,
            y: 50,
            ancho: 440,
            alto: 40
        }

    },

    filas: [
        // Estacionamiento general: 30 automóviles
        {
            prefijo: "G-",
            zona: "GENERAL",
            tipo: "AUTOMOVIL",
            cantidad: 7,
            inicio: 1,
            x: 520,
            y: 670,
            orientacion: "VERTICAL",
            direccionX: 0,
            direccionY: -1,
            separacion: 50
        },
        {
            prefijo: "G-",
            zona: "GENERAL",
            tipo: "AUTOMOVIL",
            cantidad: 6,
            inicio: 8,
            x: 350,
            y: 210,
            orientacion: "HORIZONTAL",
            direccionX: -1,
            direccionY: 0,
            separacion: 50
        },
        {
            prefijo: "G-",
            zona: "GENERAL",
            tipo: "AUTOMOVIL",
            cantidad: 8,
            inicio: 14,
            x: 450,
            y: 120,
            orientacion: "HORIZONTAL",
            direccionX: -1,
            direccionY: 0,
            separacion: 50
        },
        {
            prefijo: "G-",
            zona: "GENERAL",
            tipo: "AUTOMOVIL",
            cantidad: 6,
            inicio: 22,
            x: 620,
            y: 620,
            orientacion: "VERTICAL",
            direccionX: 0,
            direccionY: -1,
            separacion: 50
        },

        // Estacionamiento para motocicletas: 14
        {
            prefijo: "GM-",
            zona: "GENERAL",
            tipo: "MOTOCICLETA",
            cantidad: 7,
            inicio: 1,
            x: 520,
            y: 330,
            orientacion: "Horizontal",
            direccionX: 0,
            direccionY: -1,
            separacion: 16
        },
        {
            prefijo: "GM-",
            zona: "GENERAL",
            tipo: "MOTOCICLETA",
            cantidad: 7,
            inicio: 8,
            x: 400,
            y: 210,
            orientacion: "VERTICAL",
            rotarEtiqueta: true,
            direccionX: 1,
            direccionY: 0,
            separacion: 16
        },
        {
            prefijo: "GM-",
            zona: "GENERAL",
            tipo: "MOTOCICLETA",
            cantidad: 7,
            inicio: 15,
            x: 620,
            y: 330,
            orientacion: "Horizontal",
            direccionX: 0,
            direccionY: -1,
            separacion: 16
        },

        // Estacionamiento para docentes: 32 automóviles
        {
            prefijo: "D-",
            zona: "DOCENTES",
            tipo: "AUTOMOVIL",
            cantidad: 16,
            inicio: 1,
            x: 680,
            y: 620,
            orientacion: "VERTICAL",
            direccionX: 1,
            direccionY: 0,
            separacion: 30
        },
        {
            prefijo: "D-",
            zona: "DOCENTES",
            tipo: "AUTOMOVIL",
            cantidad: 16,
            inicio: 17,
            x: 680,
            y: 770,
            orientacion: "VERTICAL",
            direccionX: 1,
            direccionY: 0,
            separacion: 30
        },
    ]
};

const distribucionMapa = new Map();


function generarDistribucion() {
    distribucionMapa.clear();

    MAPA.filas.forEach(fila => {
        for (let i = 0; i < fila.cantidad; i++) {
            const numero = String(fila.inicio + i).padStart(2, "0");
            const codigo = `${fila.prefijo}${numero}`;

            distribucionMapa.set(codigo, {
                codigo,
                tipo: fila.tipo,
                zona: fila.zona,
                x: fila.x + i * fila.direccionX * fila.separacion,
                y: fila.y + i * fila.direccionY * fila.separacion,
                orientacion: fila.orientacion || "HORIZONTAL",
                rotarEtiqueta: fila.rotarEtiqueta === true            });
        }
    });
}


generarDistribucion();

export function obtenerDistribucionMapa() {
    return distribucionMapa;
}

export function obtenerConfiguracionMapa() {
    return MAPA;
}
