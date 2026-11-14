package com.controlpark.dto;

public record LoginRequest(
    String correo,
    String password
) {
}