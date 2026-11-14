package com.controlpark.repository;

import com.controlpark.model.Espacio;
import com.controlpark.model.EstadoEspacio;
import com.controlpark.model.TipoVehiculo;
import com.controlpark.model.Zona;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EspacioRepository extends JpaRepository<Espacio, Long> {

    List<Espacio> findByEstado(EstadoEspacio estado);

    List<Espacio> findByZonaAndEstado(Zona zona, EstadoEspacio estado);

    List<Espacio> findByTipoVehiculoAndEstado(TipoVehiculo tipoVehiculo, EstadoEspacio estado);

}