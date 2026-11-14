package com.controlpark.controller;

import com.controlpark.dto.LoginRequest;
import com.controlpark.dto.LoginResponse;
import com.controlpark.model.Usuario;
import com.controlpark.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Usuario usuario = usuarioService.buscarPorCorreo(request.correo())
                .orElse(null);

        if (usuario == null || !usuario.getPassword().equals(request.password())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Correo o contraseña incorrectos");
        }

        LoginResponse response = new LoginResponse(
                usuario.getIdUsuario(),
                usuario.getCorreo(),
                usuario.getRol()
        );

        return ResponseEntity.ok(response);
    }
}