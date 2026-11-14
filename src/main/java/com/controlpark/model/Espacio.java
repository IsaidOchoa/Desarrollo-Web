package com.controlpark.model;

import jakarta.persistence.*;

@Entity
@Table(name = "espacio")
public class Espacio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_espacio")
    private Long idEspacio;

    @Column(name = "codigo", nullable = false, unique = true)
    private String codigo;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_vehiculo", nullable = false)
    private TipoVehiculo tipoVehiculo;

    @Enumerated(EnumType.STRING)
    @Column(name = "zona", nullable = false)
    private Zona zona;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoEspacio estado;

    public Espacio() {
    }

    public Long getIdEspacio() {
        return idEspacio;
    }

    public void setIdEspacio(Long idEspacio) {
        this.idEspacio = idEspacio;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public TipoVehiculo getTipoVehiculo() {
        return tipoVehiculo;
    }

    public void setTipoVehiculo(TipoVehiculo tipoVehiculo) {
        this.tipoVehiculo = tipoVehiculo;
    }

    public Zona getZona() {
        return zona;
    }

    public void setZona(Zona zona) {
        this.zona = zona;
    }

    public EstadoEspacio getEstado() {
        return estado;
    }

    public void setEstado(EstadoEspacio estado) {
        this.estado = estado;
    }
}