package com.controlpark.dto;

import com.controlpark.model.TipoVehiculo;

public record VehiculoResponse(
    Long idVehiculo,
    TipoVehiculo tipo,
    String placas
) {
}