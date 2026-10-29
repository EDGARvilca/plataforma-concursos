package com.concursos.plataforma.api;

import com.concursos.plataforma.dto.CompetitionProgress;
import com.concursos.plataforma.dto.ConfigChecklist;
import com.concursos.plataforma.dto.DashboardStats;
import com.concursos.plataforma.dto.EvaluationRow;
import com.concursos.plataforma.dto.RankingRow;
import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.model.Category;
import com.concursos.plataforma.model.Competition;
import com.concursos.plataforma.model.Institution;
import com.concursos.plataforma.model.RubricCriterion;
import com.concursos.plataforma.model.Submission;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Las "vistas" son lo que la API le entrega al frontend en formato JSON.
 * Las uso para no exponer las entidades de la base de datos tal cual
 * (así evito ciclos entre objetos y no filtro datos como la contraseña).
 */
public final class Vistas {

    private Vistas() {
    }

    public record UsuarioVista(Long id, String nombre, String correo, String rol, String rolEtiqueta,
                               boolean activo, Long institucionId, String institucion) {
    }

    public record InstitucionVista(Long id, String nombre, String ciudad, boolean activa) {
    }

    public record ConcursoVista(Long id, String nombre, String descripcion, LocalDate fechaInicio,
                                LocalDate fechaCierre, String estado, String estadoEtiqueta, String tipo,
                                Integer cupoMaximo, Integer minimoJurados, String condiciones,
                                Long organizadorId, String organizador, boolean tieneBases,
                                String nombreBases) {
    }

    public record CategoriaVista(Long id, String nombre, String descripcion, boolean activa) {
    }

    public record CriterioVista(Long id, String nombre, String descripcion, Double puntajeMaximo, Double peso) {
    }

    public record ProyectoVista(Long id, String codigo, String titulo, String resumen, String integrantes,
                                String institucionGrado, Long categoriaId, String categoria, Long concursoId,
                                String concurso, String estado, String observacion, boolean tieneArchivo,
                                String nombreArchivo, LocalDateTime fechaEnvio, int cantidadJurados) {
    }

    public record ProgresoVista(long proyectos, long asignaciones, long evaluacionesEnviadas, double avance,
                                double pesoRubrica) {
    }

    public record ListaVerificacionVista(int categorias, double pesoRubrica, int proyectos, int asignaciones,
                                         int minimoJurados, boolean categoriasListas, boolean rubricaLista,
                                         boolean juradosListos, boolean proyectosListos) {
    }

    public record FilaEvaluacionVista(String codigo, String proyecto, String categoria, String jurado,
                                      String estado, Double puntaje, LocalDateTime fechaEnvio) {
    }

    public record FilaRankingVista(Long proyectoId, int puesto, String titulo, String integrantes, String categoria,
                                   long evaluacionesEnviadas, long juradosAsignados, double promedio,
                                   String estado) {
    }

    public record EstadisticasVista(long concursos, long concursosActivos, long proyectos, long jurados,
                                    long evaluacionesEnviadas, long asignaciones, double avance) {
    }

    public static ProgresoVista progreso(CompetitionProgress progreso) {
        return new ProgresoVista(progreso.projects(), progreso.assignments(), progreso.submittedEvaluations(),
                progreso.evaluationProgress(), progreso.rubricWeight());
    }

    public static ListaVerificacionVista listaVerificacion(ConfigChecklist lista) {
        return new ListaVerificacionVista(lista.categories(), lista.rubricWeight(), lista.projects(),
                lista.assignments(), lista.requiredJudges(), lista.categoriesOk(), lista.rubricOk(),
                lista.judgesOk(), lista.projectsOk());
    }

    public static FilaEvaluacionVista filaEvaluacion(EvaluationRow fila) {
        return new FilaEvaluacionVista(fila.projectCode(), fila.project(), fila.category(), fila.judge(),
                fila.status(), fila.score(), fila.submittedAt());
    }

    public static FilaRankingVista filaRanking(RankingRow fila, int puesto) {
        return new FilaRankingVista(fila.submissionId(), puesto, fila.title(), fila.participants(), fila.category(),
                fila.submittedEvaluations(), fila.assignedJudges(), fila.score(), fila.status());
    }

    public static EstadisticasVista estadisticas(DashboardStats datos) {
        return new EstadisticasVista(datos.competitions(), datos.activeCompetitions(), datos.projects(),
                datos.judges(), datos.submittedEvaluations(), datos.totalAssignments(), datos.evaluationProgress());
    }

    public static UsuarioVista usuario(AppUser usuario) {
        Institution institucion = usuario.getInstitution();
        return new UsuarioVista(usuario.getId(), usuario.getFullName(), usuario.getEmail(),
                usuario.getRole().name(), usuario.getRole().getLabel(), usuario.isActive(),
                institucion == null ? null : institucion.getId(),
                institucion == null ? null : institucion.getName());
    }

    public static InstitucionVista institucion(Institution institucion) {
        return new InstitucionVista(institucion.getId(), institucion.getName(), institucion.getCity(), institucion.isActive());
    }

    public static ConcursoVista concurso(Competition concurso) {
        AppUser organizador = concurso.getOrganizer();
        return new ConcursoVista(concurso.getId(), concurso.getName(), concurso.getDescription(),
                concurso.getStartDate(), concurso.getEndDate(), concurso.getStatus().name(),
                concurso.getStatus().getLabel(), concurso.getType(), concurso.getMaxProjects(),
                concurso.requiredJudges(), concurso.getConditions(),
                organizador == null ? null : organizador.getId(),
                organizador == null ? null : organizador.getFullName(),
                concurso.hasBases(), concurso.getBasesOriginalName());
    }

    public static CategoriaVista categoria(Category categoria) {
        return new CategoriaVista(categoria.getId(), categoria.getName(), categoria.getDescription(), categoria.isActive());
    }

    public static CriterioVista criterio(RubricCriterion criterio) {
        return new CriterioVista(criterio.getId(), criterio.getName(), criterio.getDescription(),
                criterio.getMaxScore(), criterio.getWeight());
    }

    public static ProyectoVista proyecto(Submission proyecto, String estado, int cantidadJurados) {
        Category categoria = proyecto.getCategory();
        return new ProyectoVista(proyecto.getId(), proyecto.getCode(), proyecto.getTitle(), proyecto.getSummary(),
                proyecto.getParticipantNames(), proyecto.getInstitutionGrade(),
                categoria == null ? null : categoria.getId(),
                categoria == null ? "Sin categoría" : categoria.getName(),
                proyecto.getCompetition().getId(), proyecto.getCompetition().getName(), estado,
                proyecto.getOrganizerObservation(), proyecto.hasFile(), proyecto.getFileOriginalName(),
                proyecto.getSubmittedAt(), cantidadJurados);
    }
}
