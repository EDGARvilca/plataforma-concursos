package com.concursos.plataforma.model;

import jakarta.persistence.*;

/** Institución a la que pertenecen los usuarios (colegio, universidad, asociación...). */
@Entity
@Table(name = "institutions")
public class Institution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String city;

    /** Nullable a propósito: las filas antiguas sin valor se consideran activas. */
    private Boolean active;

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public boolean isActive() { return active == null || active; }
    public void setActive(boolean active) { this.active = active; }
}
