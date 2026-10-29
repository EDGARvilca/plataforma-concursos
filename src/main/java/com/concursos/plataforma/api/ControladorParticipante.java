package com.concursos.plataforma.api;

import com.concursos.plataforma.api.Vistas.CategoriaVista;
import com.concursos.plataforma.api.Vistas.ConcursoVista;
import com.concursos.plataforma.api.Vistas.ProyectoVista;
import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.model.Competition;
import com.concursos.plataforma.model.CompetitionStatus;
import com.concursos.plataforma.model.Submission;
import com.concursos.plataforma.service.CompetitionService;
import com.concursos.plataforma.service.CurrentUserService;
import com.concursos.plataforma.service.EvaluationService;
import com.concursos.plataforma.service.ParticipationService;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Portal del participante: mis proyectos, registro, seguimiento y observaciones. */
@RestController
@RequestMapping("/api/participante")
public class ControladorParticipante {

    /** Etapas de la línea de tiempo del seguimiento. */
    private static final List<String> ETAPAS = List.of("Inscrito", "Validado", "Evaluación", "Resultado");

    public record ProyectoConEtapa(ProyectoVista proyecto, int etapa) {
    }

    public record DatosInicio(List<ProyectoConEtapa> proyectos, List<ConcursoVista> convocatoriasAbiertas,
                              List<String> etapas) {
    }

    public record DatosRegistro(List<ConcursoVista> convocatorias, ConcursoVista seleccionada,
                                List<CategoriaVista> categorias, ProyectoVista existente) {
    }

    public record DatosSeguimiento(ProyectoVista proyecto, int etapa, List<String> etapas,
                                   List<String> comentariosJurados, boolean puedeActualizar) {
    }

    public record DatosObservaciones(ProyectoVista proyecto, List<String> comentariosJurados) {
    }

    private final CurrentUserService usuarioActual;
    private final ParticipationService participacion;
    private final CompetitionService concursos;
    private final EvaluationService evaluaciones;
    private final ArmadorVistas armador;

    public ControladorParticipante(CurrentUserService usuarioActual, ParticipationService participacion,
                                   CompetitionService concursos, EvaluationService evaluaciones,
                                   ArmadorVistas armador) {
        this.usuarioActual = usuarioActual;
        this.participacion = participacion;
        this.concursos = concursos;
        this.evaluaciones = evaluaciones;
        this.armador = armador;
    }

    @GetMapping("/inicio")
    public DatosInicio inicio(Authentication autenticacion) {
        AppUser usuario = usuarioActual.require(autenticacion);
        List<ProyectoConEtapa> proyectos = participacion.submissionsFor(usuario).stream()
                .map(proyecto -> new ProyectoConEtapa(armador.proyecto(proyecto), etapaDe(proyecto))).toList();
        return new DatosInicio(proyectos,
                participacion.openCompetitions().stream().map(Vistas::concurso).toList(), ETAPAS);
    }

    @GetMapping("/registro")
    public DatosRegistro datosRegistro(@RequestParam(required = false) Long concursoId, Authentication autenticacion) {
        AppUser usuario = usuarioActual.require(autenticacion);
        List<Competition> abiertas = participacion.openCompetitions();
        Competition elegida = abiertas.stream()
                .filter(concurso -> concursoId == null || concurso.getId().equals(concursoId))
                .findFirst().orElse(null);
        Submission existente = elegida == null ? null : participacion.findSubmission(usuario, elegida).orElse(null);
        return new DatosRegistro(abiertas.stream().map(Vistas::concurso).toList(),
                elegida == null ? null : Vistas.concurso(elegida),
                elegida == null ? List.of() : concursos.activeCategories(elegida).stream().map(Vistas::categoria).toList(),
                existente == null ? null : armador.proyecto(existente));
    }

    @PostMapping("/registro")
    public ProyectoVista registrar(@RequestParam Long concursoId, @RequestParam(required = false) Long categoriaId,
                                   @RequestParam String titulo, @RequestParam(required = false) String resumen,
                                   @RequestParam(name = "integrantes", required = false) List<String> integrantes,
                                   @RequestParam(required = false) String institucionGrado,
                                   @RequestParam("archivo") MultipartFile archivo, Authentication autenticacion) {
        Submission guardado = participacion.submit(concursoId, categoriaId, titulo, resumen,
                ControladorProyectos.unir(integrantes), institucionGrado, archivo, usuarioActual.require(autenticacion));
        return armador.proyecto(guardado);
    }

    @GetMapping("/proyectos/{id}")
    public DatosSeguimiento seguimiento(@PathVariable Long id, Authentication autenticacion) {
        Submission proyecto = participacion.getOwned(id, usuarioActual.require(autenticacion));
        return new DatosSeguimiento(armador.proyecto(proyecto), etapaDe(proyecto), ETAPAS,
                evaluaciones.feedbackFor(proyecto),
                proyecto.getCompetition().getStatus() == CompetitionStatus.OPEN);
    }

    @PostMapping("/proyectos/{id}/archivo")
    public ProyectoVista actualizarArchivo(@PathVariable Long id, @RequestParam("archivo") MultipartFile archivo,
                                           Authentication autenticacion) {
        return armador.proyecto(participacion.updateFile(id, archivo, usuarioActual.require(autenticacion)));
    }

    @GetMapping("/proyectos/{id}/archivo")
    public ResponseEntity<Resource> descargarArchivo(@PathVariable Long id, Authentication autenticacion) {
        Submission proyecto = participacion.getOwned(id, usuarioActual.require(autenticacion));
        return Descargas.archivo(participacion.submissionFile(proyecto), proyecto.getFileOriginalName(), proyecto.getFileContentType());
    }

    @GetMapping("/convocatorias/{id}/bases")
    public ResponseEntity<Resource> descargarBases(@PathVariable Long id) {
        Competition concurso = participacion.getOpen(id);
        return Descargas.archivo(participacion.basesFile(concurso), concurso.getBasesOriginalName(), concurso.getBasesContentType());
    }

    @GetMapping("/observaciones")
    public List<DatosObservaciones> observaciones(Authentication autenticacion) {
        return participacion.submissionsFor(usuarioActual.require(autenticacion)).stream()
                .map(proyecto -> new DatosObservaciones(armador.proyecto(proyecto), evaluaciones.feedbackFor(proyecto)))
                .toList();
    }

    /** 0 Inscrito · 1 Validado (ya tiene jurados) · 2 En evaluación · 3 Resultado (concurso cerrado). */
    private int etapaDe(Submission proyecto) {
        if (proyecto.getCompetition().getStatus() == CompetitionStatus.CLOSED) {
            return 3;
        }
        if (!"Inscrito".equals(evaluaciones.projectState(proyecto))) {
            return 2;
        }
        return concursos.assignmentsOf(proyecto).isEmpty() ? 0 : 1;
    }
}
