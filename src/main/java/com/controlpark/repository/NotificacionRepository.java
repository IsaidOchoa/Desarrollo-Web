
package com.controlpark.repository;

import com.controlpark.model.Notificacion;
import com.controlpark.model.TipoNotificacion;
import com.controlpark.model.EstadoNotificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByUsuarioIdUsuarioOrderByFechaCreacionDesc(Long idUsuario);

    List<Notificacion> findByUsuarioIdUsuarioAndEstado(
        Long idUsuario,
        EstadoNotificacion estado
    );

    List<Notificacion> findByUsuarioIdUsuarioAndLeidaFalse(Long idUsuario);

    long countByUsuarioIdUsuarioAndLeidaFalse(Long idUsuario);

    Optional<Notificacion> findByOcupacion_IdOcupacionAndTipoAndEstado(
        Long idOcupacion,
        TipoNotificacion tipo,
        EstadoNotificacion estado
    );
}
