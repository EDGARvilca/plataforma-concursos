package com.concursos.plataforma.api;

import com.concursos.plataforma.api.Vistas.CategoriaVista;
import com.concursos.plataforma.api.Vistas.ConcursoVista;
import com.concursos.plataforma.api.Vistas.ProyectoVista;
import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.model.JudgeAssignment;
import com.concursos.plataforma.model.Submission;
import com.concursos.plataforma.service.CompetitionService;
import com.concursos.plataforma.service.CurrentUserService;
import com.concursos.plataforma.service.EvaluationService;
import com.concursos.plataforma.service.ParticipationService;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Proyectos inscritos vistos por el organizador: lista, detalle, edición y observaciones. */
@RestController
@RequestMapping("/api/proyectos")
public class ControladorProyectos {

    public record SolicitudProyecto(Long concursoId, Long categoriaId, String titulo, String resumen,
                                    List<String> integrantes, String institucionGrado) {
    }

    public record SolicitudObservacion(String observacion) {
    }

    public record JuradoAsignadoVista(Long asignacionId, String jurado, String estado) {
    }

    public record DetalleProyecto(ProyectoVista proyecto, List<JuradoAsignadoVista> jurados,
                                  List<CategoriaVista> categorias) {
    }

    public record DatosListaProyectos(List<ProyectoVista> proyectos, List<ConcursoVista> concursos) {
    }

    private final CompetitionService concursos;
    private final EvaluationService evaluaciones;
    private final ParticipationService participacion;
    private final CurrentUserService usuarioActual;
    private final ArmadorVistas armador;

    public ControladorProyectos(CompetitionService concursos, EvaluationService evaluaciones,
                                ParticipationService participacion, CurrentUserService usuarioActual,
                                ArmadorVistas armador) {
        this.concursos = concursos;
        this.evaluaciones = evaluaciones;
        this.participacion = participacion;
        this.usuarioActual = usuarioActual;
        this.armador = armador;
    }

    @GetMapping
    public DatosListaProyectos listar(@RequestParam(required = false) Long concursoId, Authentication autenticacion) {
        AppUser usuario = usuarioActual.require(autenticacion);
        return new DatosListaProyectos(armador.proyectos(concursos.projectsFor(usuario, concursoId)),
                concursos.listFor(usuario).stream().map(Vistas::concurso).toList());
    }

    @PostMapping
    public ProyectoVista registrar(@RequestBody SolicitudProyecto solicitud, Authentication autenticacion) {
        concursos.getManageable(solicitud.concursoId(), usuarioActual.require(autenticacion));
        Submission proyecto = concursos.addSubmission(solicitud.concursoId(), solicitud.categoriaId(),
                solicitud.titulo(), solicitud.resumen(), unir(solicitud.integrantes()), solicitud.institucionGrado());
        return armador.proyecto(proyecto);
    }

    @GetMapping("/{id}")
    public DetalleProyecto detalle(@PathVariable Long id, Authentication autenticacion) {
        Submission proyecto = concursos.getManageableSubmission(id, usuarioActual.require(autenticacion));
        List<JuradoAsignadoVista> jurados = concursos.assignmentsOf(proyecto).stream()
                .map(this::juradoAsignado).toList();
        return new DetalleProyecto(armador.proyecto(proyecto), jurados,
                concursos.activeCategories(proyecto.getCompetition()).stream().map(Vistas::categoria).toList());
    }

    @PutMapping("/{id}")
    public ProyectoVista actualizar(@PathVariable Long id, @RequestBody SolicitudProyecto solicitud,
                                    Authentication autenticacion) {
        Submission proyecto = concursos.updateSubmission(id, solicitud.categoriaId(), solicitud.titulo(),
                solicitud.resumen(), unir(solicitud.integrantes()), solicitud.institucionGrado(),
                usuarioActual.require(autenticacion));
        return armador.proyecto(proyecto);
    }

    @PutMapping("/{id}/observacion")
    public ProyectoVista guardarObservacion(@PathVariable Long id, @RequestBody SolicitudObservacion solicitud,
                                            Authentication autenticacion) {
        return armador.proyecto(concursos.updateObservation(id, solicitud.observacion(), usuarioActual.require(autenticacion)));
    }

    @GetMapping("/{id}/archivo")
    public ResponseEntity<Resource> descargarArchivo(@PathVariable Long id, Authentication autenticacion) {
        Submission proyecto = concursos.getManageableSubmission(id, usuarioActual.require(autenticacion));
        return Descargas.archivo(participacion.submissionFile(proyecto), proyecto.getFileOriginalName(), proyecto.getFileContentType());
    }

    private JuradoAsignadoVista juradoAsignado(JudgeAssignment asignacion) {
        return new JuradoAsignadoVista(asignacion.getId(), asignacion.getJudge().getFullName(),
                evaluaciones.assignmentState(asignacion));
    }

    /** Los integrantes llegan como lista; en la base se guardan separados por " / ". */
    static String unir(List<String> integrantes) {
        if (integrantes == null) {
            return "";
        }
        return integrantes.stream().map(String::trim).filter(nombre -> !nombre.isEmpty())
                .collect(java.util.stream.Collectors.joining(" / "));
    }
}
