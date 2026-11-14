
package com.controlpark.controller;

import com.controlpark.dto.EspacioResponse;
import com.controlpark.model.Espacio;
import com.controlpark.model.EstadoEspacio;
import com.controlpark.model.Rol;
import com.controlpark.model.TipoVehiculo;
import com.controlpark.model.Zona;
import com.controlpark.service.EspacioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/espacios")
public class EspacioController {

    private final EspacioService espacioService;

    public EspacioController(EspacioService espacioService) {
        this.espacioService = espacioService;
    }

    @GetMapping
    public ResponseEntity<List<EspacioResponse>> listarTodos(
            @RequestParam(required = false) Zona zona,
            @RequestParam(required = false) EstadoEspacio estado,
            @RequestParam(required = false) TipoVehiculo tipoVehiculo) {

        List<EspacioResponse> espacios = espacioService
                .filtrarEspacios(zona, estado, tipoVehiculo)
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(espacios);
    }

    @GetMapping("/disponibles")
    public ResponseEntity<List<EspacioResponse>> listarDisponibles() {
        List<EspacioResponse> espacios = espacioService.listarDisponibles()
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(espacios);
    }

    @GetMapping("/disponibles/{rol}/{tipo}")
    public ResponseEntity<List<EspacioResponse>> listarDisponiblesPara(
            @PathVariable Rol rol,
            @PathVariable TipoVehiculo tipo) {

        List<EspacioResponse> espacios = espacioService
                .filtrarDisponibles(rol, tipo)
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(espacios);
    }

    private EspacioResponse convertirAResponse(Espacio espacio) {
        return new EspacioResponse(
                espacio.getIdEspacio(),
                espacio.getCodigo(),
                espacio.getTipoVehiculo(),
                espacio.getZona(),
                espacio.getEstado()
        );
    }
}
