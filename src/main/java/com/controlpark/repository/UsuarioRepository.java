
package com.controlpark.repository;

import com.controlpark.model.Rol;
import com.controlpark.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreoIgnoreCase(String correo);

    List<Usuario> findAllByRol(Rol rol);
}
