
package com.controlpark.controller;

import com.controlpark.dto.OcupacionRequest;
import com.controlpark.dto.OcupacionResponse;
import com.controlpark.model.Ocupacion;
import com.controlpark.service.OcupacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ocupaciones/{idUsuario}")
public class OcupacionController {

    private final OcupacionService ocupacionService;

    public OcupacionController(OcupacionService ocupacionService) {
        this.ocupacionService = ocupacionService;
    }

    @PostMapping
    public ResponseEntity<OcupacionResponse> ocupar(
            @PathVariable Long idUsuario,
            @RequestBody OcupacionRequest request) {

        Ocupacion ocupacion = ocupacionService.ocupar(
                idUsuario,
                request.idVehiculo(),
                request.idEspacio()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertirAResponse(ocupacion));
    }

    @GetMapping
    public ResponseEntity<OcupacionResponse> consultar(
            @PathVariable Long idUsuario) {

        return ocupacionService.buscarPorUsuario(idUsuario)
                .map(this::convertirAResponse)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @DeleteMapping
    public ResponseEntity<Void> liberar(
            @PathVariable Long idUsuario) {

        ocupacionService.liberarPorUsuario(idUsuario);

        return ResponseEntity.noContent().build();
    }

    private OcupacionResponse convertirAResponse(Ocupacion ocupacion) {
        return new OcupacionResponse(
                ocupacion.getIdOcupacion(),
                ocupacion.getEspacio().getIdEspacio(),
                ocupacion.getEspacio().getCodigo(),
                ocupacion.getVehiculo().getIdVehiculo(),
                ocupacion.getVehiculo().getPlacas(),
                ocupacion.getFechaInicio(),
                ocupacion.getFechaVencimiento()
        );
    }
}
