
package com.controlpark.service;

import com.controlpark.model.Usuario;
import com.controlpark.model.Vehiculo;
import com.controlpark.repository.UsuarioRepository;
import com.controlpark.repository.VehiculoRepository;
import com.controlpark.repository.OcupacionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@Service
public class VehiculoService {

    private final VehiculoRepository vehiculoRepository;
    private final UsuarioRepository usuarioRepository;
    private final OcupacionRepository ocupacionRepository;

    public VehiculoService(
            VehiculoRepository vehiculoRepository,
            UsuarioRepository usuarioRepository,
            OcupacionRepository ocupacionRepository) {
        this.vehiculoRepository = vehiculoRepository;
        this.usuarioRepository = usuarioRepository;
        this.ocupacionRepository = ocupacionRepository;
    }

    public List<Vehiculo> listarPorUsuario(Long idUsuario) {
        return vehiculoRepository.findByUsuarioIdUsuario(idUsuario);
    }

    public Vehiculo registrar(Long idUsuario, Vehiculo vehiculo) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        vehiculo.setUsuario(usuario);

        return vehiculoRepository.save(vehiculo);
    }

    public Vehiculo actualizar(Long idVehiculo, Long idUsuario, Vehiculo datos) {
        Vehiculo vehiculo = vehiculoRepository.findById(idVehiculo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Vehículo no encontrado"));

        if (!vehiculo.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "El vehículo no pertenece al usuario");
        }

        boolean tieneOcupacion = ocupacionRepository
                .findByVehiculoIdVehiculo(idVehiculo).isPresent();

        if (tieneOcupacion && !vehiculo.getTipo().equals(datos.getTipo())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede cambiar el tipo de un vehículo con ocupación activa");
        }

        vehiculo.setTipo(datos.getTipo());
        vehiculo.setPlacas(datos.getPlacas());

        return vehiculoRepository.save(vehiculo);
    }

    public void eliminar(Long idVehiculo, Long idUsuario) {
        Vehiculo vehiculo = vehiculoRepository.findById(idVehiculo)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Vehículo no encontrado"));

        if (!vehiculo.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "El vehículo no pertenece al usuario");
        }

        if (ocupacionRepository.findByVehiculoIdVehiculo(idVehiculo).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar un vehículo con ocupación activa");
        }

        vehiculoRepository.delete(vehiculo);
    }
}
