
package com.controlpark.controller;

import com.controlpark.service.EventoSseService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/eventos")
public class EventoController {

    private final EventoSseService eventoSseService;

    public EventoController(EventoSseService eventoSseService) {
        this.eventoSseService = eventoSseService;
    }

    @GetMapping(
        value = "/{idUsuario}",
        produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter conectar(@PathVariable Long idUsuario) {
        return eventoSseService.conectar(idUsuario);
    }
}
