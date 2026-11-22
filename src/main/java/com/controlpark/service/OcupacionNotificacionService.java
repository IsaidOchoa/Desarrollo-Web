
package com.controlpark.service;

import com.controlpark.model.*;
import com.controlpark.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OcupacionNotificacionService {

    private final OcupacionRepository ocupacionRepository;
    private final NotificacionRepository notificacionRepository;
    private final OcupacionService ocupacionService;
    private final NotificacionService notificacionService;

    public OcupacionNotificacionService(
            OcupacionRepository ocupacionRepository,
            NotificacionRepository notificacionRepository,
            OcupacionService ocupacionService,
            NotificacionService notificacionService) {
        this.ocupacionRepository = ocupacionRepository;
        this.notificacionRepository = notificacionRepository;
        this.ocupacionService = ocupacionService;
        this.notificacionService = notificacionService;
    }

    @Transactional
    public Notificacion responder(
            Long idNotificacion,
            Long idUsuario,
            boolean continuarOcupando) {

        Notificacion notificacion = notificacionRepository.findById(idNotificacion)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Notificación no encontrada"));

        if (!notificacion.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "La notificación no pertenece al usuario");
        }

        if (notificacion.getEstado() != EstadoNotificacion.PENDIENTE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La notificación ya fue atendida o expiró");
        }

        if (notificacion.getTipo() != TipoNotificacion.CONFIRMAR_OCUPACION) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Esta notificación no admite una respuesta de ocupación");
        }

        Ocupacion ocupacion = notificacion.getOcupacion();

        if (ocupacion == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "La ocupación ya no está disponible");
        }

        LocalDateTime limiteRespuesta =
                ocupacion.getFechaVencimiento().plusMinutes(1);

        if (LocalDateTime.now().isAfter(limiteRespuesta)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El tiempo para responder ha terminado");
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

    @Scheduled(fixedRate = 15000)
    @Transactional
    public void revisarOcupaciones() {
        LocalDateTime ahora = LocalDateTime.now();

        enviarAvisosDeVencimiento(ahora);
        revisarOcupacionesVencidas(ahora);
    }

    private void enviarAvisosDeVencimiento(LocalDateTime ahora) {
        List<Ocupacion> ocupaciones = ocupacionRepository
                .findByAvisoEnviadoFalseAndFechaVencimientoLessThanEqual(ahora);

        for (Ocupacion ocupacion : ocupaciones) {
            ocupacion.setAvisoEnviado(true);
            ocupacionRepository.save(ocupacion);

            notificacionService.crear(
                    ocupacion.getUsuario().getIdUsuario(),
                    ocupacion.getIdOcupacion(),
                    TipoNotificacion.CONFIRMAR_OCUPACION,
                    "Tu tiempo de ocupación ha terminado. ¿Deseas continuar ocupando el espacio?");
        }
    }

    private void revisarOcupacionesVencidas(LocalDateTime ahora) {
        List<Ocupacion> ocupaciones = ocupacionRepository
                .findByAvisoEnviadoTrueAndFechaVencimientoLessThanEqualAndEspacio_EstadoNot(
                        ahora.minusMinutes(1),
                        EstadoEspacio.EN_REVISION);

        for (Ocupacion ocupacion : ocupaciones) {
            Long idOcupacion = ocupacion.getIdOcupacion();
            Long idUsuario = ocupacion.getUsuario().getIdUsuario();

            notificacionRepository
                    .findByOcupacion_IdOcupacionAndTipoAndEstado(
                            idOcupacion,
                            TipoNotificacion.CONFIRMAR_OCUPACION,
                            EstadoNotificacion.PENDIENTE)
                    .ifPresent(notificacion ->
                            notificacionService.expirar(
                                    notificacion.getIdNotificacion()));

            ocupacionService.marcarEnRevision(idOcupacion);

            notificacionService.crear(
                    idUsuario,
                    idOcupacion,
                    TipoNotificacion.OCUPACION_EN_REVISION,
                    "Tu ocupación pasó a revisión porque no recibimos una respuesta a tiempo.");

            notificacionService.notificarAdministradores(
                    idOcupacion,
                    TipoNotificacion.OCUPACION_EN_REVISION,
                    "Una ocupación requiere revisión porque el usuario no respondió al aviso de vencimiento.");
        }
    }

    @Transactional
    public void liberarPorAdministrador(Long idOcupacion) {
        Ocupacion ocupacion = ocupacionRepository.findById(idOcupacion)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Ocupación no encontrada"));

        Long idUsuario = ocupacion.getUsuario().getIdUsuario();

        ocupacionService.liberarPorAdministrador(idOcupacion);

        notificacionService.crear(
                idUsuario,
                null,
                TipoNotificacion.ESPACIO_LIBERADO,
                "Tu espacio de estacionamiento ha sido liberado.");
    }
}
