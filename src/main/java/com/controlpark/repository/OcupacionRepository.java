package com.controlpark.repository;

import com.controlpark.model.Ocupacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OcupacionRepository extends JpaRepository<Ocupacion, Long> {

    Optional<Ocupacion> findByUsuarioIdUsuario(Long idUsuario);

    Optional<Ocupacion> findByEspacioIdEspacio(Long idEspacio);

    Optional<Ocupacion> findByVehiculoIdVehiculo(Long idVehiculo);

}