
package com.controlpark.controller;

import com.controlpark.dto.LoginRequest;
import com.controlpark.dto.LoginResponse;
import com.controlpark.model.Usuario;
import com.controlpark.service.UsuarioService;
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
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        Usuario usuario = usuarioService.autenticar(
                request.correo(),
                request.password()
        );

        LoginResponse response = new LoginResponse(
                usuario.getIdUsuario(),
                usuario.getCorreo(),
                usuario.getRol()
        );

        return ResponseEntity.ok(response);
    }
}
