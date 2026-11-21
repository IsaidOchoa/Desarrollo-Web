
package com.controlpark.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class EventoSseService {

    private final ConcurrentHashMap<Long, CopyOnWriteArrayList<SseEmitter>> conexiones =
            new ConcurrentHashMap<>();

    public SseEmitter conectar(Long idUsuario) {
        SseEmitter emitter = new SseEmitter(0L);

        conexiones.computeIfAbsent(
                idUsuario,
                id -> new CopyOnWriteArrayList<>()
        ).add(emitter);

        emitter.onCompletion(() -> eliminarConexion(idUsuario, emitter));
        emitter.onTimeout(() -> eliminarConexion(idUsuario, emitter));
        emitter.onError(error -> eliminarConexion(idUsuario, emitter));

        try {
            emitter.send(
                    SseEmitter.event()
                            .name("conexion-establecida")
                            .data(Map.of("conectado", true))
            );
        } catch (IOException error) {
            eliminarConexion(idUsuario, emitter);
        }

        return emitter;
    }

    public void publicarMapaActualizado() {
        ejecutarDespuesDeConfirmar(() -> enviarMapaActualizado());
    }

    public void publicarNotificacionNueva(
            Long idUsuario,
            Long idNotificacion,
            String tipo) {

        ejecutarDespuesDeConfirmar(() ->
                enviarNotificacionNueva(idUsuario, idNotificacion, tipo)
        );
    }

    private void enviarMapaActualizado() {
        Map<String, Object> datos = Map.of(
                "actualizado", true,
                "fecha", LocalDateTime.now().toString()
        );

        conexiones.values().forEach(lista ->
                lista.forEach(emitter ->
                        enviarEvento(emitter, "mapa-actualizado", datos)
                )
        );
    }

    private void enviarNotificacionNueva(
            Long idUsuario,
            Long idNotificacion,
            String tipo) {

        List<SseEmitter> emitters = conexiones.get(idUsuario);

        if (emitters == null) return;

        Map<String, Object> datos = Map.of(
                "idNotificacion", idNotificacion,
                "tipo", tipo
        );

        emitters.forEach(emitter ->
                enviarEvento(emitter, "notificacion-nueva", datos)
        );
    }

    private void enviarEvento(
            SseEmitter emitter,
            String nombre,
            Object datos) {

        try {
            emitter.send(
                    SseEmitter.event()
                            .name(nombre)
                            .data(datos)
            );
        } catch (IOException | IllegalStateException error) {
            emitter.completeWithError(error);
        }
    }

    private void eliminarConexion(Long idUsuario, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = conexiones.get(idUsuario);

        if (emitters == null) return;

        emitters.remove(emitter);

        if (emitters.isEmpty()) {
            conexiones.remove(idUsuario, emitters);
        }
    }

    private void ejecutarDespuesDeConfirmar(Runnable accion) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(
                    new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            accion.run();
                        }
                    }
            );
        } else {
            accion.run();
        }
    }

    @Scheduled(fixedRate = 25000)
    public void enviarLatido() {
        conexiones.values().forEach(lista ->
                lista.forEach(emitter -> {
                    try {
                        emitter.send(
                                SseEmitter.event().comment("keep-alive")
                        );
                    } catch (IOException | IllegalStateException error) {
                        emitter.completeWithError(error);
                    }
                })
        );
    }
}
