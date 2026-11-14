package com.controlpark.dto;

import com.controlpark.model.Rol;

public record LoginResponse(
    Long idUsuario,
    String correo,
    Rol rol
) {
}