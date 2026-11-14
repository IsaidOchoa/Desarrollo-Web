
package com.controlpark.controller;

import com.controlpark.dto.NotificacionResponse;
import com.controlpark.dto.RespuestaNotificacionRequest;
import com.controlpark.model.Notificacion;
import com.controlpark.service.NotificacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones/{idUsuario}")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
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

    @PostMapping("/{idNotificacion}/respuesta")
    public ResponseEntity<NotificacionResponse> responder(
            @PathVariable Long idUsuario,
            @PathVariable Long idNotificacion,
            @RequestBody RespuestaNotificacionRequest request) {

        Notificacion notificacion = notificacionService.responder(
                idNotificacion,
                idUsuario,
                request.continuarOcupando()
        );

        return ResponseEntity.ok(convertirAResponse(notificacion));
    }

    private NotificacionResponse convertirAResponse(Notificacion notificacion) {
        return new NotificacionResponse(
                notificacion.getIdNotificacion(),
                notificacion.getTipo(),
                notificacion.getMensaje(),
                notificacion.getFechaCreacion(),
                notificacion.getEstado()
        );
    }
}
