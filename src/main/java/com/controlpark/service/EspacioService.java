
package com.controlpark.service;

import com.controlpark.model.*;
import com.controlpark.repository.EspacioRepository;
import com.controlpark.repository.OcupacionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class EspacioService {

    private final EspacioRepository espacioRepository;
    private final OcupacionRepository ocupacionRepository;
    private final EventoSseService eventoSseService;

    public EspacioService(
            EspacioRepository espacioRepository,
            OcupacionRepository ocupacionRepository,
            EventoSseService eventoSseService) {
        this.espacioRepository = espacioRepository;
        this.ocupacionRepository = ocupacionRepository;
        this.eventoSseService = eventoSseService;
    }

    public List<Espacio> listarTodos() {
        return espacioRepository.findAll();
    }

    public List<Espacio> listarDisponibles() {
        return espacioRepository.findByEstado(EstadoEspacio.DISPONIBLE);
    }

    public List<Espacio> filtrarEspacios(
            Zona zona,
            EstadoEspacio estado,
            TipoVehiculo tipoVehiculo) {

        return espacioRepository.findAll().stream()
                .filter(e -> zona == null || e.getZona() == zona)
                .filter(e -> estado == null || e.getEstado() == estado)
                .filter(e -> tipoVehiculo == null ||
                        e.getTipoVehiculo() == tipoVehiculo)
                .toList();
    }

    public List<Espacio> filtrarDisponibles(Rol rol, TipoVehiculo tipo) {
        List<Espacio> disponibles = espacioRepository
                .findByTipoVehiculoAndEstado(tipo, EstadoEspacio.DISPONIBLE);

        if (rol == Rol.ALUMNO) {
            return disponibles.stream()
                    .filter(e -> e.getZona() == Zona.GENERAL)
                    .toList();
        }

        if (rol == Rol.DOCENTE) {
            List<Espacio> docentes = disponibles.stream()
                    .filter(e -> e.getZona() == Zona.DOCENTES)
                    .toList();

            if (!docentes.isEmpty()) {
                return docentes;
            }

            return disponibles.stream()
                    .filter(e -> e.getZona() == Zona.GENERAL)
                    .toList();
        }

        return disponibles;
    }

    @Transactional
    public Espacio cambiarEstado(Long idEspacio, EstadoEspacio estado) {
        Espacio espacio = espacioRepository.findById(idEspacio)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Espacio no encontrado"));

        if (estado == EstadoEspacio.DISPONIBLE &&
                ocupacionRepository.findByEspacioIdEspacio(idEspacio).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No puedes liberar directamente un espacio con una ocupación activa. Utiliza la opción de liberar ocupación.");
        }

        espacio.setEstado(estado);

        Espacio actualizado = espacioRepository.save(espacio);

        eventoSseService.publicarMapaActualizado();

        return actualizado;
    }
}
