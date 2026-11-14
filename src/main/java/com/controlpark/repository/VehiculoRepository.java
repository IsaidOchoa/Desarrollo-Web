package com.controlpark.repository;

import com.controlpark.model.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {

    List<Vehiculo> findByUsuarioIdUsuario(Long idUsuario);

}