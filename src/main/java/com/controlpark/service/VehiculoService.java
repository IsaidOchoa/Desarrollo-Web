
package com.controlpark.service;

import com.controlpark.model.Usuario;
import com.controlpark.model.Vehiculo;
import com.controlpark.repository.UsuarioRepository;
import com.controlpark.repository.VehiculoRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VehiculoService {

    private final VehiculoRepository vehiculoRepository;
    private final UsuarioRepository usuarioRepository;

    public VehiculoService(
            VehiculoRepository vehiculoRepository,
            UsuarioRepository usuarioRepository) {
        this.vehiculoRepository = vehiculoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Vehiculo> listarPorUsuario(Long idUsuario) {
        return vehiculoRepository.findByUsuarioIdUsuario(idUsuario);
    }

    public Vehiculo registrar(Long idUsuario, Vehiculo vehiculo) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        vehiculo.setUsuario(usuario);

        return vehiculoRepository.save(vehiculo);
    }

    public void eliminar(Long idVehiculo, Long idUsuario) {
        Vehiculo vehiculo = vehiculoRepository.findById(idVehiculo)
                .orElseThrow(() -> new IllegalArgumentException("Vehículo no encontrado"));

        if (!vehiculo.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new IllegalArgumentException("El vehículo no pertenece al usuario");
        }

        vehiculoRepository.delete(vehiculo);
    }
}
