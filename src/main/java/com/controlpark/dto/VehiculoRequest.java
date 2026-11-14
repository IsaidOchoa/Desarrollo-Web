package com.controlpark.dto;

import com.controlpark.model.TipoVehiculo;

public record VehiculoRequest(
    TipoVehiculo tipo,
    String placas
) {
}