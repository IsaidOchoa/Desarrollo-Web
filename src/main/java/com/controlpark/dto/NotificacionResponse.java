
package com.controlpark.dto;

import com.controlpark.model.TipoNotificacion;
import com.controlpark.model.EstadoNotificacion;
import java.time.LocalDateTime;

public record NotificacionResponse(
    Long idNotificacion,
    Long idOcupacion,
    TipoNotificacion tipo,
    String mensaje,
    LocalDateTime fechaCreacion,
    EstadoNotificacion estado,
    boolean leida
) {
}
