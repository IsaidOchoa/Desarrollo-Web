
package com.controlpark.service;

import com.controlpark.model.*;
import com.controlpark.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OcupacionService {

    private final OcupacionRepository ocupacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final VehiculoRepository vehiculoRepository;
    private final EspacioRepository espacioRepository;

    public OcupacionService(
            OcupacionRepository ocupacionRepository,
            UsuarioRepository usuarioRepository,
            VehiculoRepository vehiculoRepository,
            EspacioRepository espacioRepository) {
        this.ocupacionRepository = ocupacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.espacioRepository = espacioRepository;
    }

    @Transactional
    public Ocupacion ocupar(Long idUsuario, Long idVehiculo, Long idEspacio) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Vehiculo vehiculo = vehiculoRepository.findById(idVehiculo)
                .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado"));

        Espacio espacio = espacioRepository.findById(idEspacio)
                .orElseThrow(() -> new IllegalArgumentException("Espacio no encontrado"));

        if (!vehiculo.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new IllegalArgumentException("El vehículo no pertenece al usuario");
        }

        if (ocupacionRepository.findByUsuarioIdUsuario(idUsuario).isPresent()) {
            throw new IllegalArgumentException("El usuario ya tiene una ocupación activa");
        }

        if (ocupacionRepository.findByVehiculoIdVehiculo(idVehiculo).isPresent()) {
            throw new IllegalArgumentException("El vehículo ya tiene una ocupación activa");
        }

        if (ocupacionRepository.findByEspacioIdEspacio(idEspacio).isPresent()) {
            throw new IllegalArgumentException("El espacio ya está ocupado");
        }

        if (espacio.getEstado() != EstadoEspacio.DISPONIBLE) {
            throw new IllegalArgumentException("El espacio no está disponible");
        }

        if (espacio.getTipoVehiculo() != vehiculo.getTipo()) {
            throw new IllegalArgumentException("El tipo de vehículo no corresponde al espacio");
        }

        if (usuario.getRol() == Rol.ALUMNO && espacio.getZona() != Zona.GENERAL) {
            throw new IllegalArgumentException("Los alumnos solo pueden utilizar espacios generales");
        }

        if (usuario.getRol() == Rol.DOCENTE && espacio.getZona() == Zona.GENERAL) {
            boolean hayEspaciosDocentes = espacioRepository
                    .findByZonaAndEstado(Zona.DOCENTES, EstadoEspacio.DISPONIBLE)
                    .stream()
                    .anyMatch(e -> e.getTipoVehiculo() == vehiculo.getTipo());

            if (hayEspaciosDocentes) {
                throw new IllegalArgumentException("Debes utilizar primero los espacios para docentes");
            }
        }

        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime limite = ahora.toLocalDate().atTime(23, 55);

        if (!ahora.isBefore(limite)) {
            throw new IllegalArgumentException("No se permiten nuevas ocupaciones después de las 21:00");
        }

        LocalDateTime vencimiento = ahora.plusHours(3);

        if (vencimiento.isAfter(limite)) {
            vencimiento = limite;
        }

        Ocupacion ocupacion = new Ocupacion();
        ocupacion.setUsuario(usuario);
        ocupacion.setVehiculo(vehiculo);
        ocupacion.setEspacio(espacio);
        ocupacion.setFechaInicio(ahora);
        ocupacion.setFechaVencimiento(vencimiento);

        espacio.setEstado(EstadoEspacio.OCUPADO);
        espacioRepository.save(espacio);

        return ocupacionRepository.save(ocupacion);
    }

    public Optional<Ocupacion> buscarPorUsuario(Long idUsuario) {
        return ocupacionRepository.findByUsuarioIdUsuario(idUsuario);
    }

    @Transactional
    public Ocupacion extender(Long idUsuario) {
        Ocupacion ocupacion = ocupacionRepository.findByUsuarioIdUsuario(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("No tienes una ocupación activa"));

        LocalDateTime ahora = LocalDateTime.now();

        if (ahora.isAfter(ocupacion.getFechaVencimiento())) {
            throw new IllegalArgumentException("El tiempo de respuesta ha terminado");
        }

        LocalDateTime limite = ahora.toLocalDate().atTime(21, 0);
        LocalDateTime nuevoVencimiento = ocupacion.getFechaVencimiento().plusHours(3);

        if (nuevoVencimiento.isAfter(limite)) {
            nuevoVencimiento = limite;
        }

        if (!nuevoVencimiento.isAfter(ocupacion.getFechaVencimiento())) {
            throw new IllegalArgumentException("La ocupación ya alcanzó el límite de las 21:00");
        }

        ocupacion.setFechaVencimiento(nuevoVencimiento);

        return ocupacionRepository.save(ocupacion);
    }

    @Transactional
    public void liberarPorUsuario(Long idUsuario) {
        Ocupacion ocupacion = ocupacionRepository.findByUsuarioIdUsuario(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("No tienes una ocupación activa"));

        liberarOcupacion(ocupacion);
    }

    @Transactional
    public void marcarEnRevision(Long idOcupacion) {
        Ocupacion ocupacion = obtenerOcupacion(idOcupacion);

        Espacio espacio = ocupacion.getEspacio();
        espacio.setEstado(EstadoEspacio.EN_REVISION);

        espacioRepository.save(espacio);
    }

    @Transactional
    public void confirmarOcupacion(Long idOcupacion) {
        Ocupacion ocupacion = obtenerOcupacion(idOcupacion);

        Espacio espacio = ocupacion.getEspacio();
        espacio.setEstado(EstadoEspacio.OCUPADO);

        espacioRepository.save(espacio);
    }

    @Transactional
    public void liberarPorAdministrador(Long idOcupacion) {
        Ocupacion ocupacion = obtenerOcupacion(idOcupacion);

        liberarOcupacion(ocupacion);
    }

    private Ocupacion obtenerOcupacion(Long idOcupacion) {
        return ocupacionRepository.findById(idOcupacion)
                .orElseThrow(() -> new IllegalArgumentException("Ocupación no encontrada"));
    }

    private void liberarOcupacion(Ocupacion ocupacion) {
        Espacio espacio = ocupacion.getEspacio();
        espacio.setEstado(EstadoEspacio.DISPONIBLE);

        espacioRepository.save(espacio);
        ocupacionRepository.delete(ocupacion);
    }
}
