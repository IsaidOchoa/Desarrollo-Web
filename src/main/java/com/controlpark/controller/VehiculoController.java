package com.controlpark.controller;

import com.controlpark.dto.VehiculoRequest;
import com.controlpark.dto.VehiculoResponse;
import com.controlpark.model.Vehiculo;
import com.controlpark.service.VehiculoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehiculos/{idUsuario}")
public class VehiculoController {

    private final VehiculoService vehiculoService;

    public VehiculoController(VehiculoService vehiculoService) {
        this.vehiculoService = vehiculoService;
    }

    @GetMapping
    public ResponseEntity<List<VehiculoResponse>> listar(@PathVariable Long idUsuario) {
        List<VehiculoResponse> vehiculos = vehiculoService.listarPorUsuario(idUsuario)
                .stream()
                .map(this::convertirAResponse)
                .toList();

        return ResponseEntity.ok(vehiculos);
    }

    @PostMapping
    public ResponseEntity<VehiculoResponse> registrar(
            @PathVariable Long idUsuario,
            @RequestBody VehiculoRequest request) {

        Vehiculo vehiculo = new Vehiculo();
        vehiculo.setTipo(request.tipo());
        vehiculo.setPlacas(request.placas());

        Vehiculo guardado = vehiculoService.registrar(idUsuario, vehiculo);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(convertirAResponse(guardado));
    }

    @DeleteMapping("/{idVehiculo}")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long idUsuario,
            @PathVariable Long idVehiculo) {

        vehiculoService.eliminar(idVehiculo, idUsuario);

        return ResponseEntity.noContent().build();
    }

    private VehiculoResponse convertirAResponse(Vehiculo vehiculo) {
        return new VehiculoResponse(
                vehiculo.getIdVehiculo(),
                vehiculo.getTipo(),
                vehiculo.getPlacas()
        );
    }
}