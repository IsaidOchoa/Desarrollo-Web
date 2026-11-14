package com.controlpark.dto;

import com.controlpark.model.EstadoEspacio;

public record CambioEstadoEspacioRequest(
    EstadoEspacio estado
) {
}