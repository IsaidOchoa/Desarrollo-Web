
package com.controlpark.repository;

import com.controlpark.model.Ocupacion;
import com.controlpark.model.EstadoEspacio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OcupacionRepository extends JpaRepository<Ocupacion, Long> {

    Optional<Ocupacion> findByUsuarioIdUsuario(Long idUsuario);

    Optional<Ocupacion> findByEspacioIdEspacio(Long idEspacio);

    Optional<Ocupacion> findByVehiculoIdVehiculo(Long idVehiculo);

    List<Ocupacion> findByAvisoEnviadoFalseAndFechaVencimientoBetween(
            LocalDateTime inicio,
            LocalDateTime fin);

    List<Ocupacion> findByAvisoEnviadoTrueAndFechaVencimientoLessThanEqualAndEspacio_EstadoNot(
            LocalDateTime fecha,
            EstadoEspacio estado);

    List<Ocupacion> findByAvisoEnviadoFalseAndFechaVencimientoLessThanEqual(
            LocalDateTime fecha);

}
