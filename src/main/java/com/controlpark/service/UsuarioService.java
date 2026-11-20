
package com.controlpark.service;

import com.controlpark.model.Rol;
import com.controlpark.model.Usuario;
import com.controlpark.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Optional;

@Service
public class UsuarioService {

    private static final String ALUMNO_REGEX =
            "^zs\\d{8}@estudiantes\\.uv\\.mx$";

    private static final String DOCENTE_REGEX =
            "^zs\\d{8}@docentes\\.uv\\.mx$";

    private static final String CORREO_ADMIN =
            "zs12345678@admin.uv.mx";

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Optional<Usuario> buscarPorCorreo(String correo) {
        return usuarioRepository.findByCorreoIgnoreCase(correo);
    }

    @Transactional
    public Usuario autenticar(String correo, String password) {

        if (correo == null || correo.isBlank() ||
                password == null || password.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debes ingresar tu correo y contraseña"
            );
        }

        correo = correo.trim().toLowerCase(Locale.ROOT);

        Optional<Usuario> usuarioExistente =
                usuarioRepository.findByCorreoIgnoreCase(correo);

        if (usuarioExistente.isPresent()) {
            Usuario usuario = usuarioExistente.get();

            if (!usuario.getPassword().equals(password)) {
                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Correo o contraseña incorrectos"
                );
            }

            return usuario;
        }

        Rol rol = determinarRol(correo);

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setCorreo(correo);
        nuevoUsuario.setPassword(password);
        nuevoUsuario.setRol(rol);

        return usuarioRepository.save(nuevoUsuario);
    }

    private Rol determinarRol(String correo) {

        if (correo.equals(CORREO_ADMIN)) {
            return Rol.ADMINISTRADOR;
        }

        if (correo.matches(ALUMNO_REGEX)) {
            return Rol.ALUMNO;
        }

        if (correo.matches(DOCENTE_REGEX)) {
            return Rol.DOCENTE;
        }

        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "El correo no tiene un formato válido"
        );
    }

    public Usuario guardar(Usuario usuario) {

        if (usuarioRepository.findByCorreoIgnoreCase(
                usuario.getCorreo()).isPresent()) {
            throw new IllegalArgumentException(
                    "El correo ya está registrado"
            );
        }

        return usuarioRepository.save(usuario);
    }
}
