package com.concursos.plataforma.api;

import com.concursos.plataforma.api.Vistas.CriterioVista;
import com.concursos.plataforma.api.Vistas.ProyectoVista;
import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.model.Evaluation;
import com.concursos.plataforma.model.JudgeAssignment;
import com.concursos.plataforma.model.Submission;
import com.concursos.plataforma.service.CompetitionService;
import com.concursos.plataforma.service.CurrentUserService;
import com.concursos.plataforma.service.EvaluationService;
import com.concursos.plataforma.service.ParticipationService;
import java.util.HashMap;
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
import org.springframework.web.bind.annotation.RestController;

/** Lo que ve y hace el jurado: sus asignaciones, el detalle del proyecto y la evaluación con rúbrica. */
@RestController
@RequestMapping("/api/jurado")
public class ControladorJurado {

    public record AsignacionVista(Long id, String codigo, String proyecto, String concurso, String categoria,
                                  String estado) {
    }

    public record ResumenJurado(List<AsignacionVista> asignaciones, int total, long enviadas, long pendientes,
                                long avance) {
    }

    public record DetalleAsignacion(Long id, ProyectoVista proyecto, String estado) {
    }

    public record DatosEvaluacion(Long asignacionId, ProyectoVista proyecto, String estado,
                                  List<CriterioVista> criterios, Map<Long, Double> puntajes,
                                  String observaciones, double puntajeFinal) {
    }

    public record SolicitudEvaluacion(Map<Long, Double> puntajes, String observaciones) {
    }

    private final CurrentUserService usuarioActual;
    private final EvaluationService evaluaciones;
    private final ParticipationService participacion;
    private final ArmadorVistas armador;

    public ControladorJurado(CurrentUserService usuarioActual, EvaluationService evaluaciones,
                             ParticipationService participacion, CompetitionService concursos,
                             ArmadorVistas armador) {
        this.usuarioActual = usuarioActual;
        this.evaluaciones = evaluaciones;
        this.participacion = participacion;
        this.armador = armador;
    }

    @GetMapping("/asignaciones")
    public ResumenJurado asignaciones(Authentication autenticacion) {
        AppUser jurado = usuarioActual.require(autenticacion);
        List<AsignacionVista> lista = evaluaciones.assignmentsFor(jurado).stream().map(this::asignacion).toList();
        long enviadas = lista.stream().filter(item -> "Enviada".equals(item.estado())).count();
        long avance = lista.isEmpty() ? 0 : Math.round(enviadas * 100.0 / lista.size());
        return new ResumenJurado(lista, lista.size(), enviadas, lista.size() - enviadas, avance);
    }

    @GetMapping("/asignaciones/{id}")
    public DetalleAsignacion detalle(@PathVariable Long id, Authentication autenticacion) {
        JudgeAssignment asignacion = evaluaciones.getAssignment(id, usuarioActual.require(autenticacion));
        return new DetalleAsignacion(id, armador.proyecto(asignacion.getSubmission()), evaluaciones.assignmentState(asignacion));
    }

    @GetMapping("/asignaciones/{id}/archivo")
    public ResponseEntity<Resource> descargarArchivo(@PathVariable Long id, Authentication autenticacion) {
        Submission proyecto = evaluaciones.getAssignment(id, usuarioActual.require(autenticacion)).getSubmission();
        return Descargas.archivo(participacion.submissionFile(proyecto), proyecto.getFileOriginalName(), proyecto.getFileContentType());
    }

    @GetMapping("/evaluaciones/{id}")
    public DatosEvaluacion evaluacion(@PathVariable Long id, Authentication autenticacion) {
        return armarEvaluacion(evaluaciones.getAssignment(id, usuarioActual.require(autenticacion)));
    }

    @PutMapping("/evaluaciones/{id}/borrador")
    public DatosEvaluacion guardarBorrador(@PathVariable Long id, @RequestBody SolicitudEvaluacion solicitud,
                                           Authentication autenticacion) {
        JudgeAssignment asignacion = evaluaciones.getAssignment(id, usuarioActual.require(autenticacion));
        evaluaciones.saveDraft(asignacion, solicitud.observaciones(), puntajesSeguros(solicitud));
        return armarEvaluacion(asignacion);
    }

    @PostMapping("/evaluaciones/{id}/enviar")
    public DatosEvaluacion enviar(@PathVariable Long id, @RequestBody SolicitudEvaluacion solicitud,
                                  Authentication autenticacion) {
        JudgeAssignment asignacion = evaluaciones.getAssignment(id, usuarioActual.require(autenticacion));
        evaluaciones.submit(asignacion, solicitud.observaciones(), puntajesSeguros(solicitud));
        return armarEvaluacion(asignacion);
    }

    private DatosEvaluacion armarEvaluacion(JudgeAssignment asignacion) {
        Evaluation evaluacion = evaluaciones.findEvaluation(asignacion).orElse(null);
        Map<Long, Double> puntajes = evaluacion == null ? Map.of() : evaluaciones.scoreMap(evaluacion);
        return new DatosEvaluacion(asignacion.getId(), armador.proyecto(asignacion.getSubmission()),
                evaluaciones.assignmentState(asignacion),
                evaluaciones.criteriaFor(asignacion).stream().map(Vistas::criterio).toList(),
                puntajes, evaluacion == null ? "" : evaluacion.getComments(),
                evaluaciones.weightedPercent(asignacion, puntajes));
    }

    private AsignacionVista asignacion(JudgeAssignment asignacion) {
        Submission proyecto = asignacion.getSubmission();
        return new AsignacionVista(asignacion.getId(), proyecto.getCode(), proyecto.getTitle(),
                proyecto.getCompetition().getName(),
                proyecto.getCategory() == null ? "Sin categoría" : proyecto.getCategory().getName(),
                evaluaciones.assignmentState(asignacion));
    }

    private Map<Long, Double> puntajesSeguros(SolicitudEvaluacion solicitud) {
        Map<Long, Double> limpios = new HashMap<>();
        if (solicitud.puntajes() != null) {
            solicitud.puntajes().forEach((criterio, valor) -> {
                if (valor != null) {
                    limpios.put(criterio, valor);
                }
            });
        }
        return limpios;
    }
}
