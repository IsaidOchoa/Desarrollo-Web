# Desarrollo Web - ControlPark

Es una aplicación web diseñada para consultar y gestionar la disponibilidad de espacios de estacionamiento de una institución universitaria.

## Descripción

ControlPark busca facilitar el uso del estacionamiento mediante la consulta de disponibilidad de espacios en tiempo real. Su propósito es que alumnos y docentes puedan conocer las condiciones del estacionamiento antes de llegar, evitando recorridos innecesarios cuando no hay lugares disponibles.

La aplicación permite visualizar los espacios mediante un mapa interactivo, registrar la ocupación y liberación de cajones, y recibir notificaciones relacionadas con el tiempo de permanencia.

## Funcionalidades principales

- Visualización interactiva del estacionamiento y sus espacios.
- Consulta de disponibilidad en tiempo real.
- Registro de ocupación y liberación de espacios.
- Administración de vehículos asociados a cada usuario.
- Notificaciones sobre el tiempo de ocupación.
- Solicitud de confirmación para extender una ocupación.
- Supervisión y modificación manual del estado de los espacios por parte del administrador.
- Actualización de información mediante eventos enviados por el servidor (SSE).

## Roles de usuario

| Rol | Funcionalidades |
|---|---|
| Alumno | Consulta de espacios y ocupación de cajones de uso general. |
| Docente | Consulta de espacios y ocupación de cajones para docentes o, cuando no hay disponibilidad, de uso general. |
| Administrador | Supervisión del estacionamiento, consulta de notificaciones y modificación manual del estado de los espacios. |

## Tecnologías utilizadas

### Backend
- Java 21
- Spring Boot
- Spring Web MVC
- Spring Data JPA
- Hibernate
- Spring Security
- Spring Validation

### Frontend
- HTML5
- CSS3
- JavaScript
- Fetch API

### Base de datos
- MySQL

## Requisitos previos

Para ejecutar el proyecto se necesita:

- Java JDK 21.
- MySQL.
- Maven (opcional, ya que el proyecto incluye Maven Wrapper).
- Git.

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/IsaidOchoa/Desarrollo-Web.git
cd controlpark
```

### 2. Crear la base de datos

Iniciar sesión en MySQL y crear la base de datos:

```sql
CREATE DATABASE controlpark;
```

Después, ejecuta las instrucciones en el archivo controlpark/database/controlpark.sql

### 3. Configurar la conexión

Revisar el archivo de configuración de Spring Boot y establecer los datos de conexión a MySQL:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/controlpark
spring.datasource.username=TU_USUARIO
spring.datasource.password=TU_CONTRASEÑA
```

Los valores deben corresponder a la configuración local de MySQL.

### 4. Ejecutar la aplicación

Desde la carpeta raíz del proyecto:

```bash
./mvnw spring-boot:run
```

En Windows también se puede utilizar:

```bash
mvnw.cmd spring-boot:run
```

### 5. Acceder a la aplicación

Abrir en el navegador:

```text
http://localhost:8080
```

## Estructura del proyecto

```text
ControlPark/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/controlpark/
│   │   │       ├── config/       # Configuración y manejo de excepciones
│   │   │       ├── controller/   # Controladores REST
│   │   │       ├── dto/          # Objetos de transferencia de datos
│   │   │       ├── model/        # Entidades y enumeraciones
│   │   │       ├── repository/   # Acceso a datos
│   │   │       ├── service/      # Lógica de negocio
│   │   │       └── ControlparkApplication.java
│   │   └── resources/
│   │       ├── static/           # Archivos HTML, CSS y JavaScript
│   └── test/                     
├── .vscode/
├── pom.xml
└── README.md
```

## Consideraciones

- Los espacios de estacionamiento se encuentran definidos previamente en la base de datos.
- Los permisos de ocupación dependen del rol del usuario y de la zona del estacionamiento.
- Las ocupaciones tienen un tiempo establecido y cuentan con un mecanismo de notificaciones para solicitar confirmación o extensión.
- La aplicación utiliza SSE para comunicar actualizaciones del servidor al cliente sin necesidad de recargar la página.

## Contexto académico

Proyecto desarrollado individualmente como parte de la Experiencia Educativa **Desarrollo Web**, de la Universidad Veracruzana.

