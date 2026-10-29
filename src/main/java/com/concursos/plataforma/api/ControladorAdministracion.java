package com.concursos.plataforma.api;

import com.concursos.plataforma.api.Vistas.InstitucionVista;
import com.concursos.plataforma.api.Vistas.UsuarioVista;
import com.concursos.plataforma.model.Role;
import com.concursos.plataforma.service.AdminService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Gestión de usuarios e instituciones (solo administrador). */
@RestController
@RequestMapping("/api/administracion")
public class ControladorAdministracion {

    public record SolicitudUsuario(String nombre, String correo, String clave, Role rol, Long institucionId,
                                   boolean activo) {
    }

    public record SolicitudInstitucion(String nombre, String ciudad, boolean activa) {
    }

    private final AdminService administracion;

    public ControladorAdministracion(AdminService administracion) {
        this.administracion = administracion;
    }

    @GetMapping("/usuarios")
    public List<UsuarioVista> usuarios() {
        return administracion.users().stream().map(Vistas::usuario).toList();
    }

    @PostMapping("/usuarios")
    public UsuarioVista crearUsuario(@RequestBody SolicitudUsuario solicitud) {
        return Vistas.usuario(administracion.create(solicitud.nombre(), solicitud.correo(), solicitud.clave(),
                solicitud.rol(), solicitud.institucionId(), solicitud.activo()));
    }

    @PutMapping("/usuarios/{id}")
    public UsuarioVista actualizarUsuario(@PathVariable Long id, @RequestBody SolicitudUsuario solicitud,
                                          Authentication autenticacion) {
        return Vistas.usuario(administracion.update(id, solicitud.nombre(), solicitud.correo(), solicitud.rol(),
                solicitud.clave(), autenticacion.getName(), solicitud.institucionId(), solicitud.activo()));
    }

    @GetMapping("/instituciones")
    public List<InstitucionVista> instituciones() {
        return administracion.institutions().stream().map(Vistas::institucion).toList();
    }

    @PostMapping("/instituciones")
    public InstitucionVista crearInstitucion(@RequestBody SolicitudInstitucion solicitud) {
        return Vistas.institucion(administracion.saveInstitution(null, solicitud.nombre(), solicitud.ciudad(), solicitud.activa()));
    }

    @PutMapping("/instituciones/{id}")
    public InstitucionVista actualizarInstitucion(@PathVariable Long id, @RequestBody SolicitudInstitucion solicitud) {
        return Vistas.institucion(administracion.saveInstitution(id, solicitud.nombre(), solicitud.ciudad(), solicitud.activa()));
    }
}
