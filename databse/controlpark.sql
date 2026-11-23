
-- =====================================================
-- ControlPark
-- Creación de base de datos y estructura
-- =====================================================

CREATE DATABASE IF NOT EXISTS controlpark
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE controlpark;

CREATE TABLE usuario (
    id_usuario BIGINT NOT NULL AUTO_INCREMENT,
    correo VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('ADMINISTRADOR', 'ALUMNO', 'DOCENTE') NOT NULL,
    PRIMARY KEY (id_usuario),
    UNIQUE KEY UK2mlfr087gb1ce55f2j87o74t (correo)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE espacio (
    id_espacio BIGINT NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(255) NOT NULL,
    estado ENUM('DISPONIBLE', 'EN_REVISION', 'FUERA_SERVICIO', 'OCUPADO') NOT NULL,
    tipo_vehiculo ENUM('AUTOMOVIL', 'MOTOCICLETA') NOT NULL,
    zona ENUM('DOCENTES', 'GENERAL') NOT NULL,
    PRIMARY KEY (id_espacio),
    UNIQUE KEY UKjjsb6t4omntuyrbqa40lec9cq (codigo)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE vehiculo (
    id_vehiculo BIGINT NOT NULL AUTO_INCREMENT,
    placas VARCHAR(255) NOT NULL,
    tipo ENUM('AUTOMOVIL', 'MOTOCICLETA') NOT NULL,
    id_usuario BIGINT NOT NULL,
    PRIMARY KEY (id_vehiculo),
    KEY FKkaeermww27hken1p9mw4q4hfp (id_usuario),
    CONSTRAINT FKkaeermww27hken1p9mw4q4hfp
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE ocupacion (
    id_ocupacion BIGINT NOT NULL AUTO_INCREMENT,
    fecha_inicio DATETIME(6) NOT NULL,
    fecha_vencimiento DATETIME(6) NOT NULL,
    id_espacio BIGINT NOT NULL,
    id_usuario BIGINT NOT NULL,
    id_vehiculo BIGINT NOT NULL,
    aviso_enviado TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id_ocupacion),
    UNIQUE KEY UKhlucxlk1uevf6b16eer7k6p36 (id_espacio),
    UNIQUE KEY UKjxaq1nt93e0obt29u05krj4da (id_usuario),
    UNIQUE KEY UKsdaoax0tpk87af2lcocxt00ch (id_vehiculo),
    CONSTRAINT FKaifgt6gxs3pcql3fel0tgrhr
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario),
    CONSTRAINT FKbrb5y1kegsuu3ctvw9r9tu0kx
        FOREIGN KEY (id_vehiculo)
        REFERENCES vehiculo (id_vehiculo),
    CONSTRAINT FKrlvfmymi2evteboifyjbs6gow
        FOREIGN KEY (id_espacio)
        REFERENCES espacio (id_espacio)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


CREATE TABLE notificacion (
    id_notificacion BIGINT NOT NULL AUTO_INCREMENT,
    estado ENUM('ATENDIDA', 'EXPIRADA', 'PENDIENTE') NOT NULL,
    fecha_creacion DATETIME(6) NOT NULL,
    fecha_respuesta DATETIME(6) DEFAULT NULL,
    mensaje VARCHAR(255) NOT NULL,
    tipo ENUM('CONFIRMAR_OCUPACION', 'OCUPACION_EN_REVISION', 'ESPACIO_LIBERADO') NOT NULL,
    id_ocupacion BIGINT DEFAULT NULL,
    id_usuario BIGINT NOT NULL,
    leida TINYINT(1) NOT NULL DEFAULT 0,
    PRIMARY KEY (id_notificacion),
    KEY FKh61fx2vdfn6jiwmamuqvr9m0h (id_ocupacion),
    KEY FKcl7wnfwly3cree0u7ghsy10tu (id_usuario),
    CONSTRAINT FKcl7wnfwly3cree0u7ghsy10tu
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario),
    CONSTRAINT FKh61fx2vdfn6jiwmamuqvr9m0h
        FOREIGN KEY (id_ocupacion)
        REFERENCES ocupacion (id_ocupacion)
        ON DELETE SET NULL
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_0900_ai_ci;


-- =====================================================
-- Registro de espacios iniciales del estacionamiento
-- Total: 80 espacios
-- =====================================================

-- Espacios generales para automóviles (27)

INSERT INTO espacio (codigo, estado, tipo_vehiculo, zona)
VALUES
('G-01', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-02', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-03', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-04', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-05', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-06', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-07', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-08', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-09', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-10', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-11', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-12', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-13', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-14', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-15', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-16', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-17', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-18', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-19', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-20', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-21', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-22', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-23', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-24', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-25', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-26', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL'),
('G-27', 'DISPONIBLE', 'AUTOMOVIL', 'GENERAL');

-- Espacios generales para motocicletas (21)

INSERT INTO espacio (codigo, estado, tipo_vehiculo, zona)
VALUES
('GM-01', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-02', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-03', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-04', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-05', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-06', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-07', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-08', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-09', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-10', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-11', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-12', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-13', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-14', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-15', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-16', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-17', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-18', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-19', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-20', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL'),
('GM-21', 'DISPONIBLE', 'MOTOCICLETA', 'GENERAL');

-- Espacios para docentes (32)

INSERT INTO espacio (codigo, estado, tipo_vehiculo, zona)
VALUES
('D-01', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-02', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-03', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-04', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-05', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-06', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-07', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-08', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-09', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-10', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-11', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-12', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-13', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-14', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-15', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-16', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-17', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-18', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-19', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-20', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-21', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-22', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-23', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-24', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-25', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-26', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-27', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-28', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-29', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-30', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-31', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES'),
('D-32', 'DISPONIBLE', 'AUTOMOVIL', 'DOCENTES');
