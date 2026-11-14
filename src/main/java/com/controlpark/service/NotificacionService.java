
package com.controlpark.service;

import com.controlpark.model.*;
import com.controlpark.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final OcupacionRepository ocupacionRepository;
    private final OcupacionService ocupacionService;

    public NotificacionService(
            NotificacionRepository notificacionRepository,
            UsuarioRepository usuarioRepository,
            OcupacionRepository ocupacionRepository,
            OcupacionService ocupacionService) {
        this.notificacionRepository = notificacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.ocupacionRepository = ocupacionRepository;
        this.ocupacionService = ocupacionService;
    }

    public List<Notificacion> listarPorUsuario(Long idUsuario) {
        return notificacionRepository
                .findByUsuarioIdUsuarioOrderByFechaCreacionDesc(idUsuario);
    }

    public List<Notificacion> listarPendientes(Long idUsuario) {
        return notificacionRepository
                .findByUsuarioIdUsuarioAndEstado(idUsuario, EstadoNotificacion.PENDIENTE);
    }

    @Transactional
    public Notificacion crear(
            Long idUsuario,
            Long idOcupacion,
            TipoNotificacion tipo,
            String mensaje) {

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(usuario);
        notificacion.setTipo(tipo);
        notificacion.setMensaje(mensaje);
        notificacion.setFechaCreacion(LocalDateTime.now());
        notificacion.setEstado(EstadoNotificacion.PENDIENTE);

        if (idOcupacion != null) {
            Ocupacion ocupacion = ocupacionRepository.findById(idOcupacion)
                    .orElseThrow(() -> new IllegalArgumentException("Ocupación no encontrada"));

            notificacion.setOcupacion(ocupacion);
        }

        return notificacionRepository.save(notificacion);
    }

    @Transactional
    public Notificacion responder(
            Long idNotificacion,
            Long idUsuario,
            boolean continuarOcupando) {

        Notificacion notificacion = notificacionRepository.findById(idNotificacion)
                .orElseThrow(() -> new IllegalArgumentException("Notificación no encontrada"));

        if (!notificacion.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new IllegalArgumentException("La notificación no pertenece al usuario");
        }

        if (notificacion.getEstado() != EstadoNotificacion.PENDIENTE) {
            throw new IllegalArgumentException("La notificación ya fue atendida o expiró");
        }

        if (notificacion.getTipo() != TipoNotificacion.AVISO_VENCIMIENTO) {
            throw new IllegalArgumentException("Esta notificación no admite una respuesta de ocupación");
        }

        if (continuarOcupando) {
            ocupacionService.extender(idUsuario);
        } else {
            ocupacionService.liberarPorUsuario(idUsuario);
        }

        notificacion.setEstado(EstadoNotificacion.ATENDIDA);
        notificacion.setFechaRespuesta(LocalDateTime.now());

        return notificacionRepository.save(notificacion);
    }

    @Transactional
    public Notificacion marcarAtendida(Long idNotificacion, Long idUsuario) {
        Notificacion notificacion = notificacionRepository.findById(idNotificacion)
                .orElseThrow(() -> new IllegalArgumentException("Notificación no encontrada"));

        if (!notificacion.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new IllegalArgumentException("La notificación no pertenece al usuario");
        }

        if (notificacion.getEstado() != EstadoNotificacion.PENDIENTE) {
            throw new IllegalArgumentException("La notificación ya fue atendida o expiró");
        }

        notificacion.setEstado(EstadoNotificacion.ATENDIDA);
        notificacion.setFechaRespuesta(LocalDateTime.now());

        return notificacionRepository.save(notificacion);
    }

    @Transactional
    public Notificacion expirar(Long idNotificacion) {
        Notificacion notificacion = notificacionRepository.findById(idNotificacion)
                .orElseThrow(() -> new IllegalArgumentException("Notificación no encontrada"));

        if (notificacion.getEstado() != EstadoNotificacion.PENDIENTE) {
            throw new IllegalArgumentException("La notificación ya no está pendiente");
        }

        notificacion.setEstado(EstadoNotificacion.EXPIRADA);

        return notificacionRepository.save(notificacion);
    }

    @Transactional
    public void notificarAdministradores(
            Long idOcupacion,
            TipoNotificacion tipo,
            String mensaje) {

        List<Usuario> administradores = usuarioRepository.findAll()
                .stream()
                .filter(usuario -> usuario.getRol() == Rol.ADMINISTRADOR)
                .toList();

        for (Usuario administrador : administradores) {
            crear(administrador.getIdUsuario(), idOcupacion, tipo, mensaje);
        }
    }
}
