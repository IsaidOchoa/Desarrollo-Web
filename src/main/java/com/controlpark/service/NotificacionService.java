
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
    private final EventoSseService eventoSseService;

    public NotificacionService(
            NotificacionRepository notificacionRepository,
            UsuarioRepository usuarioRepository,
            OcupacionRepository ocupacionRepository,
            EventoSseService eventoSseService) {
        this.notificacionRepository = notificacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.ocupacionRepository = ocupacionRepository;
        this.eventoSseService = eventoSseService;
    }

    public List<Notificacion> listarPorUsuario(Long idUsuario) {
        return notificacionRepository
                .findByUsuarioIdUsuarioOrderByFechaCreacionDesc(idUsuario);
    }

    public List<Notificacion> listarPendientes(Long idUsuario) {
        return notificacionRepository
                .findByUsuarioIdUsuarioAndEstado(idUsuario, EstadoNotificacion.PENDIENTE);
    }

    public long contarNoLeidas(Long idUsuario) {
        return notificacionRepository.countByUsuarioIdUsuarioAndLeidaFalse(idUsuario);
    }

    @Transactional
    public void marcarTodasComoLeidas(Long idUsuario) {
        List<Notificacion> noLeidas =
                notificacionRepository.findByUsuarioIdUsuarioAndLeidaFalse(idUsuario);

        for (Notificacion notificacion : noLeidas) {
            notificacion.setLeida(true);
        }

        notificacionRepository.saveAll(noLeidas);
    }

    @Transactional
    public int eliminarNotificacionesEliminables(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        boolean esAdministrador = usuario.getRol() == Rol.ADMINISTRADOR;

        List<Notificacion> notificaciones =
                notificacionRepository
                        .findByUsuarioIdUsuarioOrderByFechaCreacionDesc(idUsuario);

        List<Notificacion> eliminables = notificaciones.stream()
                .filter(notificacion -> esEliminable(notificacion, esAdministrador))
                .toList();

        if (eliminables.isEmpty()) {
            return 0;
        }

        notificacionRepository.deleteAll(eliminables);

        return eliminables.size();
    }

    private boolean esEliminable(
        Notificacion notificacion,
        boolean esAdministrador) {

    boolean ocupacionEliminada =
            notificacion.getTipo() == TipoNotificacion.OCUPACION_EN_REVISION &&
            notificacion.getOcupacion() == null;

    if (ocupacionEliminada) {
        return true;
    }

    if (esAdministrador) {
        boolean requiereLiberacion =
                notificacion.getTipo() == TipoNotificacion.OCUPACION_EN_REVISION &&
                notificacion.getEstado() == EstadoNotificacion.PENDIENTE &&
                notificacion.getOcupacion() != null;

        return !requiereLiberacion;
    }

    return notificacion.getEstado() == EstadoNotificacion.EXPIRADA ||
            notificacion.getEstado() == EstadoNotificacion.ATENDIDA ||
            notificacion.getTipo() == TipoNotificacion.ESPACIO_LIBERADO;
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
        notificacion.setLeida(false);

        if (idOcupacion != null) {
            Ocupacion ocupacion = ocupacionRepository.findById(idOcupacion)
                    .orElseThrow(() -> new IllegalArgumentException("Ocupación no encontrada"));

            notificacion.setOcupacion(ocupacion);
        }

        Notificacion guardada = notificacionRepository.save(notificacion);

        eventoSseService.publicarNotificacionNueva(
                idUsuario,
                guardada.getIdNotificacion(),
                guardada.getTipo().name()
        );

        return guardada;
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
        notificacion.setLeida(true);

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

        List<Usuario> administradores =
                usuarioRepository.findAllByRol(Rol.ADMINISTRADOR);

        for (Usuario administrador : administradores) {
            crear(administrador.getIdUsuario(), idOcupacion, tipo, mensaje);
        }
    }
}
