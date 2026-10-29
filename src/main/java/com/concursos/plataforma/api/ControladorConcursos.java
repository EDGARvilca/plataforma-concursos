package com.concursos.plataforma.api;

import com.concursos.plataforma.api.Vistas.CategoriaVista;
import com.concursos.plataforma.api.Vistas.ConcursoVista;
import com.concursos.plataforma.api.Vistas.CriterioVista;
import com.concursos.plataforma.api.Vistas.FilaEvaluacionVista;
import com.concursos.plataforma.api.Vistas.ListaVerificacionVista;
import com.concursos.plataforma.api.Vistas.ProgresoVista;
import com.concursos.plataforma.api.Vistas.ProyectoVista;
import com.concursos.plataforma.api.Vistas.UsuarioVista;
import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.model.Competition;
import com.concursos.plataforma.model.CompetitionStatus;
import com.concursos.plataforma.model.Submission;
import com.concursos.plataforma.service.CompetitionService;
import com.concursos.plataforma.service.CurrentUserService;
import com.concursos.plataforma.service.EvaluationService;
import com.concursos.plataforma.service.ParticipationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
import org.springframework.web.multipart.MultipartFile;

/**
 * Todo lo que el organizador y el administrador hacen sobre un concurso:
 * datos generales, categorías, rúbrica, asignación de jurados y seguimiento.
 */
@RestController
@RequestMapping("/api/concursos")
public class ControladorConcursos {

    public record SolicitudConcurso(
            @NotBlank(message = "El nombre es obligatorio") @Size(max = 160, message = "El nombre no puede superar 160 caracteres") String nombre,
            @Size(max = 1500, message = "La descripción no puede superar 1500 caracteres") String descripcion,
            LocalDate fechaInicio, LocalDate fechaCierre, CompetitionStatus estado,
            @Size(max = 80, message = "El tipo no puede superar 80 caracteres") String tipo,
            @Min(value = 1, message = "El cupo máximo debe ser al menos 1") Integer cupoMaximo,
            @Min(value = 1, message = "Se requiere al menos 1 jurado por proyecto") Integer minimoJurados,
            @Size(max = 1500, message = "Las condiciones no pueden superar 1500 caracteres") String condiciones) {
    }

    public record SolicitudEstado(CompetitionStatus estado) {
    }

    public record SolicitudOrganizador(Long organizadorId) {
    }

    public record SolicitudCategoria(String nombre, String descripcion, boolean activa) {
    }

    public record SolicitudCriterio(String nombre, String descripcion, Double puntajeMaximo, Double peso) {
    }

    public record SolicitudAsignaciones(List<String> asignar, List<String> quitar) {
    }

    public record DetalleConcurso(ConcursoVista concurso, ListaVerificacionVista lista, ProgresoVista progreso,
                                  List<UsuarioVista> organizadores) {
    }

    public record DatosAsignacion(ConcursoVista concurso, List<ProyectoVista> proyectos, List<UsuarioVista> jurados,
                                  Map<Long, List<Long>> asignados, int minimoJurados) {
    }

    public record DatosRubrica(List<CriterioVista> criterios, double pesoTotal, boolean valida) {
    }

    public record DatosSeguimiento(ConcursoVista concurso, List<FilaEvaluacionVista> filas, ProgresoVista progreso) {
    }

    private final CompetitionService concursos;
    private final EvaluationService evaluaciones;
    private final ParticipationService participacion;
    private final CurrentUserService usuarioActual;
    private final ArmadorVistas armador;

    public ControladorConcursos(CompetitionService concursos, EvaluationService evaluaciones,
                                ParticipationService participacion, CurrentUserService usuarioActual,
                                ArmadorVistas armador) {
        this.concursos = concursos;
        this.evaluaciones = evaluaciones;
        this.participacion = participacion;
        this.usuarioActual = usuarioActual;
        this.armador = armador;
    }

    // ---------------- Lista y datos generales ----------------

    @GetMapping
    public List<ConcursoVista> listar(Authentication autenticacion) {
        return concursos.listFor(usuarioActual.require(autenticacion)).stream().map(Vistas::concurso).toList();
    }

    @PostMapping
    public ConcursoVista crear(@RequestBody @Valid SolicitudConcurso solicitud, Authentication autenticacion) {
        validarFechas(solicitud);
        Competition concurso = new Competition();
        copiarDatos(solicitud, concurso);
        return Vistas.concurso(concursos.save(concurso, usuarioActual.require(autenticacion)));
    }

    @GetMapping("/{id}")
    public DetalleConcurso detalle(@PathVariable Long id, Authentication autenticacion) {
        Competition concurso = concursos.getManageable(id, usuarioActual.require(autenticacion));
        return new DetalleConcurso(Vistas.concurso(concurso), Vistas.listaVerificacion(concursos.checklist(concurso)),
                Vistas.progreso(evaluaciones.progress(concurso)),
                concursos.organizers().stream().map(Vistas::usuario).toList());
    }

    @PutMapping("/{id}")
    public ConcursoVista actualizar(@PathVariable Long id, @RequestBody @Valid SolicitudConcurso solicitud,
                                    Authentication autenticacion) {
        validarFechas(solicitud);
        Competition cambios = new Competition();
        copiarDatos(solicitud, cambios);
        return Vistas.concurso(concursos.update(id, cambios, usuarioActual.require(autenticacion)));
    }

    @PutMapping("/{id}/estado")
    public ConcursoVista cambiarEstado(@PathVariable Long id, @RequestBody SolicitudEstado solicitud,
                                       Authentication autenticacion) {
        concursos.getManageable(id, usuarioActual.require(autenticacion));
        return Vistas.concurso(concursos.updateStatus(id, solicitud.estado()));
    }

    @PutMapping("/{id}/organizador")
    public ConcursoVista cambiarOrganizador(@PathVariable Long id, @RequestBody SolicitudOrganizador solicitud,
                                            Authentication autenticacion) {
        return Vistas.concurso(concursos.changeOrganizer(id, solicitud.organizadorId(), usuarioActual.require(autenticacion)));
    }

    // ---------------- Categorías ----------------

    @GetMapping("/{id}/categorias")
    public List<CategoriaVista> categorias(@PathVariable Long id, Authentication autenticacion) {
        Competition concurso = concursos.getManageable(id, usuarioActual.require(autenticacion));
        return concursos.categories(concurso).stream().map(Vistas::categoria).toList();
    }

    @PostMapping("/{id}/categorias")
    public CategoriaVista crearCategoria(@PathVariable Long id, @RequestBody SolicitudCategoria solicitud,
                                         Authentication autenticacion) {
        concursos.getManageable(id, usuarioActual.require(autenticacion));
        return Vistas.categoria(concursos.addCategory(id, solicitud.nombre(), solicitud.descripcion(), solicitud.activa()));
    }

    @PutMapping("/{id}/categorias/{categoriaId}")
    public CategoriaVista actualizarCategoria(@PathVariable Long id, @PathVariable Long categoriaId,
                                              @RequestBody SolicitudCategoria solicitud, Authentication autenticacion) {
        return Vistas.categoria(concursos.updateCategory(id, categoriaId, solicitud.nombre(),
                solicitud.descripcion(), solicitud.activa(), usuarioActual.require(autenticacion)));
    }

    // ---------------- Rúbrica ----------------

    @GetMapping("/{id}/rubrica")
    public DatosRubrica rubrica(@PathVariable Long id, Authentication autenticacion) {
        Competition concurso = concursos.getManageable(id, usuarioActual.require(autenticacion));
        return new DatosRubrica(concursos.criteria(concurso).stream().map(Vistas::criterio).toList(),
                concursos.rubricWeight(concurso), concursos.rubricValid(concurso));
    }

    @PostMapping("/{id}/rubrica")
    public CriterioVista crearCriterio(@PathVariable Long id, @RequestBody SolicitudCriterio solicitud,
                                       Authentication autenticacion) {
        concursos.getManageable(id, usuarioActual.require(autenticacion));
        return Vistas.criterio(concursos.addCriterion(id, solicitud.nombre(), solicitud.descripcion(),
                solicitud.puntajeMaximo(), solicitud.peso()));
    }

    @PutMapping("/{id}/rubrica/{criterioId}")
    public CriterioVista actualizarCriterio(@PathVariable Long id, @PathVariable Long criterioId,
                                            @RequestBody SolicitudCriterio solicitud, Authentication autenticacion) {
        return Vistas.criterio(concursos.updateCriterion(id, criterioId, solicitud.nombre(), solicitud.descripcion(),
                solicitud.puntajeMaximo(), solicitud.peso(), usuarioActual.require(autenticacion)));
    }

    // ---------------- Asignación de jurados ----------------

    @GetMapping("/{id}/asignaciones")
    public DatosAsignacion asignaciones(@PathVariable Long id, Authentication autenticacion) {
        Competition concurso = concursos.getManageable(id, usuarioActual.require(autenticacion));
        List<Submission> proyectos = concursos.submissions(concurso);
        return new DatosAsignacion(Vistas.concurso(concurso), armador.proyectos(proyectos),
                concursos.judges().stream().map(Vistas::usuario).toList(),
                concursos.assignedJudgeIds(proyectos), concurso.requiredJudges());
    }

    /** Cada elemento de "asignar" y "quitar" tiene la forma "idProyecto:idJurado". */
    @PutMapping("/{id}/asignaciones")
    public Map<String, Object> guardarAsignaciones(@PathVariable Long id, @RequestBody SolicitudAsignaciones solicitud,
                                                   Authentication autenticacion) {
        int[] resultado = concursos.applyAssignments(id,
                solicitud.asignar() == null ? List.of() : solicitud.asignar(),
                solicitud.quitar() == null ? List.of() : solicitud.quitar(),
                usuarioActual.require(autenticacion));
        return Map.of("asignadas", resultado[0], "quitadas", resultado[1], "bloqueadas", resultado[2]);
    }

    // ---------------- Seguimiento de evaluaciones ----------------

    @GetMapping("/{id}/evaluaciones")
    public DatosSeguimiento seguimiento(@PathVariable Long id, Authentication autenticacion) {
        Competition concurso = concursos.getManageable(id, usuarioActual.require(autenticacion));
        return new DatosSeguimiento(Vistas.concurso(concurso),
                evaluaciones.evaluationRows(concurso).stream().map(Vistas::filaEvaluacion).toList(),
                Vistas.progreso(evaluaciones.progress(concurso)));
    }

    // ---------------- Bases ----------------

    @PostMapping("/{id}/bases")
    public ConcursoVista subirBases(@PathVariable Long id, @RequestParam("archivo") MultipartFile archivo,
                                    Authentication autenticacion) {
        return Vistas.concurso(concursos.uploadBases(id, archivo, usuarioActual.require(autenticacion)));
    }

    @GetMapping("/{id}/bases")
    public ResponseEntity<Resource> descargarBases(@PathVariable Long id, Authentication autenticacion) {
        Competition concurso = concursos.getManageable(id, usuarioActual.require(autenticacion));
        return Descargas.archivo(participacion.basesFile(concurso), concurso.getBasesOriginalName(), concurso.getBasesContentType());
    }

    // ---------------- Auxiliares ----------------

    private void validarFechas(SolicitudConcurso solicitud) {
        if (solicitud.fechaInicio() != null && solicitud.fechaCierre() != null
                && solicitud.fechaCierre().isBefore(solicitud.fechaInicio())) {
            throw new IllegalArgumentException("La fecha de cierre no puede ser anterior a la de inicio");
        }
    }

    private void copiarDatos(SolicitudConcurso origen, Competition destino) {
        destino.setName(origen.nombre());
        destino.setDescription(origen.descripcion());
        destino.setStartDate(origen.fechaInicio());
        destino.setEndDate(origen.fechaCierre());
        destino.setStatus(origen.estado() == null ? CompetitionStatus.DRAFT : origen.estado());
        destino.setType(origen.tipo());
        destino.setMaxProjects(origen.cupoMaximo());
        destino.setMinJudges(origen.minimoJurados());
        destino.setConditions(origen.condiciones());
    }
}
