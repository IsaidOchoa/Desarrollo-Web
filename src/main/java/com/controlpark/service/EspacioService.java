
package com.controlpark.service;

import com.controlpark.model.*;
import com.controlpark.repository.EspacioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class EspacioService {

    private final EspacioRepository espacioRepository;

    public EspacioService(EspacioRepository espacioRepository) {
        this.espacioRepository = espacioRepository;
    }

    public List<Espacio> listarTodos() {
        return espacioRepository.findAll();
    }

    public List<Espacio> listarDisponibles() {
        return espacioRepository.findByEstado(EstadoEspacio.DISPONIBLE);
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
                .orElseThrow(() -> new IllegalArgumentException("Espacio no encontrado"));

        espacio.setEstado(estado);

        return espacioRepository.save(espacio);
    }
}
