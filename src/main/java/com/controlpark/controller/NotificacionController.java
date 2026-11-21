
package com.controlpark.controller;

import com.controlpark.dto.NotificacionResponse;
import com.controlpark.dto.RespuestaNotificacionRequest;
import com.controlpark.model.Notificacion;
import com.controlpark.service.NotificacionService;
import com.controlpark.service.OcupacionNotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones/{idUsuario}")
public class NotificacionController {

    private final NotificacionService notificacionService;
    private final OcupacionNotificacionService ocupacionNotificacionService;

    public NotificacionController(
            NotificacionService notificacionService,
            OcupacionNotificacionService ocupacionNotificacionService) {
        this.notificacionService = notificacionService;
        this.ocupacionNotificacionService = ocupacionNotificacionService;
    }

    @GetMapping
    public ResponseEntity<List<NotificacionResponse>> listar(
            @PathVariable Long idUsuario) {

        List<NotificacionResponse> notificaciones = notificacionService
                .listarPorUsuario(idUsuario)
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(notificaciones);
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<NotificacionResponse>> listarPendientes(
            @PathVariable Long idUsuario) {

        List<NotificacionResponse> notificaciones = notificacionService
                .listarPendientes(idUsuario)
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(notificaciones);
    }

    @GetMapping("/contador")
    public ResponseEntity<Long> contarNoLeidas(
            @PathVariable Long idUsuario) {

        return ResponseEntity.ok(
                notificacionService.contarNoLeidas(idUsuario)
        );
    }

    @PutMapping("/leidas")
    public ResponseEntity<Void> marcarTodasComoLeidas(
            @PathVariable Long idUsuario) {

        notificacionService.marcarTodasComoLeidas(idUsuario);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{idNotificacion}/respuesta")
    public ResponseEntity<NotificacionResponse> responder(
            @PathVariable Long idUsuario,
            @PathVariable Long idNotificacion,
            @RequestBody RespuestaNotificacionRequest request) {

        Notificacion notificacion = ocupacionNotificacionService.responder(
                idNotificacion,
                idUsuario,
                request.continuarOcupando()
        );

        return ResponseEntity.ok(convertirAResponse(notificacion));
    }

    private NotificacionResponse convertirAResponse(Notificacion n) {
        Long idOcupacion = n.getOcupacion() != null
                ? n.getOcupacion().getIdOcupacion()
                : null;

        return new NotificacionResponse(
                n.getIdNotificacion(),
                idOcupacion,
                n.getTipo(),
                n.getMensaje(),
                n.getFechaCreacion(),
                n.getEstado(),
                n.isLeida()
        );
    }
}
