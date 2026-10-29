package com.concursos.plataforma.api;

import com.concursos.plataforma.api.Vistas.ConcursoVista;
import com.concursos.plataforma.api.Vistas.EstadisticasVista;
import com.concursos.plataforma.api.Vistas.ProgresoVista;
import com.concursos.plataforma.api.Vistas.ProyectoVista;
import com.concursos.plataforma.dto.ActivityItem;
import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.model.Competition;
import com.concursos.plataforma.model.Role;
import com.concursos.plataforma.service.AdminService;
import com.concursos.plataforma.service.CompetitionService;
import com.concursos.plataforma.service.CurrentUserService;
import com.concursos.plataforma.service.EvaluationService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Datos del dashboard del organizador y del administrador. */
@RestController
@RequestMapping("/api/panel")
public class ControladorPanel {

    public record DatosPanel(EstadisticasVista estadisticas, ConcursoVista concursoActivo, ProgresoVista progreso,
                             List<ProyectoVista> proyectosRecientes, Long cantidadUsuarios,
                             Long cantidadInstituciones, List<ActividadVista> actividad) {
    }

    public record ActividadVista(String texto, java.time.LocalDateTime fecha) {
    }

    private final CompetitionService concursos;
    private final EvaluationService evaluaciones;
    private final AdminService administracion;
    private final CurrentUserService usuarioActual;
    private final ArmadorVistas armador;

    public ControladorPanel(CompetitionService concursos, EvaluationService evaluaciones, AdminService administracion,
                            CurrentUserService usuarioActual, ArmadorVistas armador) {
        this.concursos = concursos;
        this.evaluaciones = evaluaciones;
        this.administracion = administracion;
        this.usuarioActual = usuarioActual;
        this.armador = armador;
    }

    @GetMapping
    public DatosPanel panel(Authentication autenticacion) {
        AppUser usuario = usuarioActual.require(autenticacion);
        Competition activo = concursos.activeCompetition(usuario);
        List<ProyectoVista> recientes = armador.proyectos(concursos.projectsFor(usuario, null).stream().limit(6).toList());

        boolean esAdmin = usuario.getRole() == Role.ADMIN;
        List<ActividadVista> actividad = esAdmin
                ? administracion.recentActivity(8).stream().map(this::actividad).toList()
                : List.of();

        return new DatosPanel(Vistas.estadisticas(concursos.dashboardStats(usuario)),
                activo == null ? null : Vistas.concurso(activo),
                activo == null ? null : Vistas.progreso(evaluaciones.progress(activo)),
                recientes,
                esAdmin ? (long) administracion.users().size() : null,
                esAdmin ? (long) administracion.institutions().size() : null,
                actividad);
    }

    private ActividadVista actividad(ActivityItem elemento) {
        return new ActividadVista(elemento.text(), elemento.at());
    }
}
