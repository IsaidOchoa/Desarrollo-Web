package com.controlpark.dto;

import java.time.LocalDateTime;

public record OcupacionResponse(
    Long idOcupacion,
    Long idEspacio,
    String codigoEspacio,
    Long idVehiculo,
    String placas,
    LocalDateTime fechaInicio,
    LocalDateTime fechaVencimiento
) {
}