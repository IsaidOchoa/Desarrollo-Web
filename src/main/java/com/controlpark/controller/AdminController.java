
package com.controlpark.controller;

import com.controlpark.dto.CambioEstadoEspacioRequest;
import com.controlpark.dto.EspacioResponse;
import com.controlpark.model.Espacio;
import com.controlpark.service.EspacioService;
import com.controlpark.service.OcupacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final OcupacionService ocupacionService;
    private final EspacioService espacioService;

    public AdminController(
            OcupacionService ocupacionService,
            EspacioService espacioService) {
        this.ocupacionService = ocupacionService;
        this.espacioService = espacioService;
    }

    @PutMapping("/ocupaciones/{idOcupacion}/confirmar")
    public ResponseEntity<Void> confirmarOcupacion(
            @PathVariable Long idOcupacion) {

        ocupacionService.confirmarOcupacion(idOcupacion);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/ocupaciones/{idOcupacion}/liberar")
    public ResponseEntity<Void> liberarOcupacion(
            @PathVariable Long idOcupacion) {

        ocupacionService.liberarPorAdministrador(idOcupacion);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/ocupaciones/{idOcupacion}/revision")
    public ResponseEntity<Void> marcarEnRevision(
            @PathVariable Long idOcupacion) {

        ocupacionService.marcarEnRevision(idOcupacion);

        return ResponseEntity.noContent().build();
    }

    @PutMapping("/espacios/{idEspacio}/estado")
    public ResponseEntity<EspacioResponse> cambiarEstado(
            @PathVariable Long idEspacio,
            @RequestBody CambioEstadoEspacioRequest request) {

        Espacio espacio = espacioService.cambiarEstado(
                idEspacio,
                request.estado()
        );

        EspacioResponse response = new EspacioResponse(
                espacio.getIdEspacio(),
                espacio.getCodigo(),
                espacio.getTipoVehiculo(),
                espacio.getZona(),
                espacio.getEstado()
        );

        return ResponseEntity.ok(response);
    }
}
