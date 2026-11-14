package com.controlpark.dto;

import com.controlpark.model.TipoVehiculo;
import com.controlpark.model.Zona;
import com.controlpark.model.EstadoEspacio;

public record EspacioResponse(
    Long idEspacio,
    String codigo,
    TipoVehiculo tipoVehiculo,
    Zona zona,
    EstadoEspacio estado
) {
}