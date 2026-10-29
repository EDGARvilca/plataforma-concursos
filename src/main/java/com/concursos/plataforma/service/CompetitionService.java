package com.concursos.plataforma.service;

import com.concursos.plataforma.dto.ConfigChecklist;
import com.concursos.plataforma.dto.DashboardStats;
import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.model.Category;
import com.concursos.plataforma.model.Competition;
import com.concursos.plataforma.model.CompetitionStatus;
import com.concursos.plataforma.model.Evaluation;
import com.concursos.plataforma.model.JudgeAssignment;
import com.concursos.plataforma.model.Role;
import com.concursos.plataforma.model.RubricCriterion;
import com.concursos.plataforma.model.Submission;
import com.concursos.plataforma.repository.AppUserRepository;
import com.concursos.plataforma.repository.CategoryRepository;
import com.concursos.plataforma.repository.CompetitionRepository;
import com.concursos.plataforma.repository.EvaluationRepository;
import com.concursos.plataforma.repository.JudgeAssignmentRepository;
import com.concursos.plataforma.repository.RubricCriterionRepository;
import com.concursos.plataforma.repository.SubmissionRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class CompetitionService {

    private final CompetitionRepository competitions;
    private final CategoryRepository categories;
    private final RubricCriterionRepository criteria;
    private final SubmissionRepository submissions;
    private final AppUserRepository users;
    private final JudgeAssignmentRepository assignments;
    private final EvaluationRepository evaluations;
    private final FileStorageService storage;

    public CompetitionService(
            CompetitionRepository competitions,
            CategoryRepository categories,
            RubricCriterionRepository criteria,
            SubmissionRepository submissions,
            AppUserRepository users,
            JudgeAssignmentRepository assignments,
            EvaluationRepository evaluations,
            FileStorageService storage) {
        this.competitions = competitions;
        this.categories = categories;
        this.criteria = criteria;
        this.submissions = submissions;
        this.users = users;
        this.assignments = assignments;
        this.evaluations = evaluations;
        this.storage = storage;
    }

    // ------------------------------------------------------------------
    // Concursos
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<Competition> listFor(AppUser user) {
        List<Competition> list = user.getRole() == Role.ADMIN
                ? new ArrayList<>(competitions.findAll())
                : new ArrayList<>(competitions.findByOrganizerOrderByIdDesc(user));
        list.sort(Comparator.comparing(Competition::getId).reversed());
        return list;
    }

    @Transactional(readOnly = true)
    public DashboardStats dashboardStats(AppUser user) {
        List<Competition> list = listFor(user);
        long active = list.stream()
                .filter(c -> c.getStatus() == CompetitionStatus.OPEN || c.getStatus() == CompetitionStatus.EVALUATION)
                .count();
        long projects = 0;
        long totalAssignments = 0;
        long submitted = 0;
        for (Competition competition : list) {
            for (Submission submission : submissions(competition)) {
                projects++;
                for (JudgeAssignment assignment : assignments.findBySubmission(submission)) {
                    totalAssignments++;
                    if (evaluations.findByAssignment(assignment).map(Evaluation::isSubmitted).orElse(false)) {
                        submitted++;
                    }
                }
            }
        }
        return new DashboardStats(list.size(), active, projects, users.findByRole(Role.JUDGE).size(), submitted, totalAssignments);
    }

    /** Concurso "activo" que se destaca en el dashboard: el primero en evaluación o abierto. */
    @Transactional(readOnly = true)
    public Competition activeCompetition(AppUser user) {
        List<Competition> list = listFor(user);
        return list.stream().filter(c -> c.getStatus() == CompetitionStatus.EVALUATION).findFirst()
                .or(() -> list.stream().filter(c -> c.getStatus() == CompetitionStatus.OPEN).findFirst())
                .orElse(list.isEmpty() ? null : list.get(0));
    }

    public Competition save(Competition competition, AppUser organizer) {
        if (competition.getOrganizer() == null) {
            competition.setOrganizer(organizer);
        }
        return competitions.save(competition);
    }

    public Competition update(Long id, Competition changes, AppUser user) {
        Competition competition = getManageable(id, user);
        competition.setName(changes.getName().trim());
        competition.setDescription(changes.getDescription() == null ? null : changes.getDescription().trim());
        competition.setStartDate(changes.getStartDate());
        competition.setEndDate(changes.getEndDate());
        competition.setStatus(changes.getStatus());
        competition.setType(changes.getType() == null || changes.getType().isBlank() ? null : changes.getType().trim());
        competition.setMaxProjects(changes.getMaxProjects());
        competition.setMinJudges(changes.getMinJudges());
        competition.setConditions(changes.getConditions() == null || changes.getConditions().isBlank() ? null : changes.getConditions().trim());
        return competitions.save(competition);
    }

    public Competition uploadBases(Long id, MultipartFile file, AppUser user) {
        Competition competition = getManageable(id, user);
        var stored = storage.store(file, "bases");
        competition.setBasesOriginalName(stored.originalName());
        competition.setBasesStoredName(stored.storedName());
        competition.setBasesContentType(stored.contentType());
        competition.setBasesSize(stored.size());
        competition.setBasesUploadedAt(LocalDateTime.now());
        return competitions.save(competition);
    }

    /** Cambia el estado. Para pasar a "En evaluación" la rúbrica debe sumar 100 % (regla del wireframe WF07). */
    public Competition updateStatus(Long id, CompetitionStatus status) {
        Competition competition = get(id);
        if (status == CompetitionStatus.EVALUATION && !rubricValid(competition)) {
            throw new IllegalArgumentException("La rúbrica debe sumar 100 % para iniciar la evaluación (suma actual: " + rubricWeight(competition) + " %)");
        }
        competition.setStatus(status);
        return competitions.save(competition);
    }

    @Transactional(readOnly = true)
    public Competition get(Long id) {
        return competitions.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Concurso no encontrado"));
    }

    @Transactional(readOnly = true)
    public Competition getManageable(Long id, AppUser user) {
        Competition competition = get(id);
        if (user.getRole() != Role.ADMIN && (competition.getOrganizer() == null || !competition.getOrganizer().getId().equals(user.getId()))) {
            throw new IllegalArgumentException("No tienes permiso para administrar este concurso");
        }
        return competition;
    }

    public Competition changeOrganizer(Long id, Long organizerId, AppUser user) {
        if (user.getRole() != Role.ADMIN) throw new IllegalArgumentException("Solo un administrador puede cambiar el organizador");
        Competition competition = get(id);
        AppUser organizer = users.findById(organizerId).filter(u -> u.getRole() == Role.ORGANIZER).orElseThrow(() -> new IllegalArgumentException("Organizador no válido"));
        competition.setOrganizer(organizer);
        return competitions.save(competition);
    }

    // ------------------------------------------------------------------
    // Categorías
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<Category> categories(Competition competition) {
        return categories.findByCompetitionOrderByName(competition);
    }

    @Transactional(readOnly = true)
    public List<Category> activeCategories(Competition competition) {
        return categories(competition).stream().filter(Category::isActive).toList();
    }

    @Transactional(readOnly = true)
    public Category category(Competition competition, Long categoryId) {
        return categories.findById(categoryId)
                .filter(c -> c.getCompetition().getId().equals(competition.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
    }

    public Category addCategory(Long competitionId, String name, String description, boolean active) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        Category category = new Category();
        category.setCompetition(get(competitionId));
        category.setName(name.trim());
        category.setDescription(description == null ? null : description.trim());
        category.setActive(active);
        return categories.save(category);
    }

    public Category updateCategory(Long competitionId, Long categoryId, String name, String description, boolean active, AppUser user) {
        Competition competition = getManageable(competitionId, user);
        if (name == null || name.isBlank()) throw new IllegalArgumentException("El nombre de la categoría es obligatorio");
        Category category = category(competition, categoryId);
        category.setName(name.trim());
        category.setDescription(description == null ? null : description.trim());
        category.setActive(active);
        return categories.save(category);
    }

    // ------------------------------------------------------------------
    // Rúbrica
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<RubricCriterion> criteria(Competition competition) {
        return criteria.findByCompetitionOrderById(competition);
    }

    @Transactional(readOnly = true)
    public RubricCriterion criterion(Competition competition, Long criterionId) {
        return criteria.findById(criterionId)
                .filter(c -> c.getCompetition().getId().equals(competition.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Criterio no encontrado"));
    }

    @Transactional(readOnly = true)
    public double rubricWeight(Competition competition) {
        double sum = criteria(competition).stream().mapToDouble(RubricCriterion::getWeight).sum();
        return Math.round(sum * 10.0) / 10.0;
    }

    @Transactional(readOnly = true)
    public boolean rubricValid(Competition competition) {
        return Math.abs(rubricWeight(competition) - 100.0) < 0.01;
    }

    public RubricCriterion addCriterion(Long competitionId, String name, String description, Double maxScore, Double weight) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("El nombre del criterio es obligatorio");
        if (maxScore == null || maxScore <= 0 || weight == null || weight <= 0) throw new IllegalArgumentException("Puntaje y peso deben ser mayores que cero");
        RubricCriterion criterion = new RubricCriterion();
        criterion.setCompetition(get(competitionId));
        criterion.setName(name.trim());
        criterion.setDescription(description == null ? null : description.trim());
        criterion.setMaxScore(maxScore);
        criterion.setWeight(weight);
        return criteria.save(criterion);
    }

    public RubricCriterion updateCriterion(Long competitionId, Long criterionId, String name, String description, Double maxScore, Double weight, AppUser user) {
        Competition competition = getManageable(competitionId, user);
        RubricCriterion criterion = criterion(competition, criterionId);
        if (name == null || name.isBlank()) throw new IllegalArgumentException("El nombre del criterio es obligatorio");
        if (maxScore == null || maxScore <= 0 || weight == null || weight <= 0) throw new IllegalArgumentException("Puntaje y peso deben ser mayores que cero");
        criterion.setName(name.trim());
        criterion.setDescription(description == null ? null : description.trim());
        criterion.setMaxScore(maxScore);
        criterion.setWeight(weight);
        return criteria.save(criterion);
    }

    // ------------------------------------------------------------------
    // Proyectos
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<Submission> submissions(Competition competition) {
        return submissions.findByCompetitionOrderByIdDesc(competition);
    }

    /** Todos los proyectos que el usuario puede gestionar, opcionalmente de un solo concurso. */
    @Transactional(readOnly = true)
    public List<Submission> projectsFor(AppUser user, Long competitionId) {
        List<Submission> result = new ArrayList<>();
        for (Competition competition : listFor(user)) {
            if (competitionId == null || competition.getId().equals(competitionId)) {
                result.addAll(submissions(competition));
            }
        }
        result.sort(Comparator.comparing(Submission::getId).reversed());
        return result;
    }

    @Transactional(readOnly = true)
    public Submission getManageableSubmission(Long submissionId, AppUser user) {
        Submission submission = submissions.findById(submissionId)
                .orElseThrow(() -> new IllegalArgumentException("Trabajo no encontrado"));
        getManageable(submission.getCompetition().getId(), user);
        return submission;
    }

    public Submission addSubmission(Long competitionId, Long categoryId, String title, String summary, String participants, String institutionGrade) {
        Competition competition = get(competitionId);
        if (title == null || title.isBlank() || participants == null || participants.isBlank()) {
            throw new IllegalArgumentException("El título y los participantes son obligatorios");
        }
        Submission submission = new Submission();
        submission.setCompetition(competition);
        submission.setCategory(categoryId == null ? null : categories.findById(categoryId).filter(c -> c.getCompetition().getId().equals(competitionId)).orElseThrow(() -> new IllegalArgumentException("Categoría no válida")));
        submission.setTitle(title.trim());
        submission.setSummary(summary == null ? null : summary.trim());
        submission.setParticipantNames(participants.trim());
        submission.setInstitutionGrade(institutionGrade == null || institutionGrade.isBlank() ? null : institutionGrade.trim());
        return submissions.save(submission);
    }

    public Submission updateSubmission(Long submissionId, Long categoryId, String title, String summary, String participants, String institutionGrade, AppUser user) {
        Submission submission = getManageableSubmission(submissionId, user);
        Long competitionId = submission.getCompetition().getId();
        if (title == null || title.isBlank() || participants == null || participants.isBlank()) {
            throw new IllegalArgumentException("El título y los participantes son obligatorios");
        }
        Category category = categoryId == null ? null : categories.findById(categoryId).filter(c -> c.getCompetition().getId().equals(competitionId)).orElseThrow(() -> new IllegalArgumentException("Categoría no válida"));
        submission.setCategory(category);
        submission.setTitle(title.trim());
        submission.setSummary(summary == null ? null : summary.trim());
        submission.setParticipantNames(participants.trim());
        submission.setInstitutionGrade(institutionGrade == null || institutionGrade.isBlank() ? null : institutionGrade.trim());
        return submissions.save(submission);
    }

    public Submission updateObservation(Long submissionId, String observation, AppUser user) {
        Submission submission = getManageableSubmission(submissionId, user);
        submission.setOrganizerObservation(observation == null || observation.isBlank() ? null : observation.trim());
        return submissions.save(submission);
    }

    // ------------------------------------------------------------------
    // Jurados y asignaciones
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<AppUser> judges() {
        return users.findByRole(Role.JUDGE).stream().filter(AppUser::isActive).toList();
    }

    @Transactional(readOnly = true)
    public List<AppUser> organizers() {
        return users.findByRole(Role.ORGANIZER);
    }

    @Transactional(readOnly = true)
    public List<JudgeAssignment> assignmentsOf(Submission submission) {
        return assignments.findBySubmission(submission);
    }

    /** Cantidad de jurados asignados por proyecto, indexada por id de proyecto. */
    @Transactional(readOnly = true)
    public Map<Long, Long> judgeCounts(List<Submission> list) {
        Map<Long, Long> counts = new HashMap<>();
        for (Submission submission : list) {
            counts.put(submission.getId(), (long) assignments.findBySubmission(submission).size());
        }
        return counts;
    }

    /** Ids de los jurados asignados a cada proyecto (para la pantalla de asignación). */
    @Transactional(readOnly = true)
    public Map<Long, List<Long>> assignedJudgeIds(List<Submission> list) {
        Map<Long, List<Long>> result = new HashMap<>();
        for (Submission submission : list) {
            result.put(submission.getId(), assignments.findBySubmission(submission).stream()
                    .map(a -> a.getJudge().getId()).toList());
        }
        return result;
    }

    @Transactional(readOnly = true)
    public long assignmentCount(Competition competition) {
        return submissions(competition).stream()
                .mapToLong(s -> assignments.findBySubmission(s).size())
                .sum();
    }

    @Transactional(readOnly = true)
    public ConfigChecklist checklist(Competition competition) {
        List<Submission> list = submissions(competition);
        int required = competition.requiredJudges();
        boolean covered = !list.isEmpty() && list.stream().allMatch(s -> assignments.findBySubmission(s).size() >= required);
        return new ConfigChecklist(
                categories(competition).size(),
                rubricWeight(competition),
                list.size(),
                (int) assignmentCount(competition),
                required,
                covered);
    }

    /** Proyectos con menos jurados que el mínimo configurado en el concurso. */
    @Transactional(readOnly = true)
    public long projectsBelowMinimum(Competition competition) {
        int required = competition.requiredJudges();
        return submissions(competition).stream().filter(s -> assignments.findBySubmission(s).size() < required).count();
    }

    /**
     * Aplica los cambios de la pantalla de asignación. Cada elemento tiene la forma "idProyecto:idJurado".
     * Una asignación con evaluación iniciada no se puede quitar. Devuelve {asignadas, quitadas, bloqueadas}.
     */
    public int[] applyAssignments(Long competitionId, List<String> toAssign, List<String> toRemove, AppUser user) {
        Competition competition = getManageable(competitionId, user);
        int added = 0;
        int removed = 0;
        int blocked = 0;

        for (String pair : toAssign) {
            Long[] ids = parsePair(pair);
            Submission submission = submissionOf(competition, ids[0]);
            if (addAssignment(submission, ids[1])) {
                added++;
            }
        }
        for (String pair : toRemove) {
            Long[] ids = parsePair(pair);
            Submission submission = submissionOf(competition, ids[0]);
            AppUser judge = users.findById(ids[1]).orElse(null);
            if (judge == null) {
                continue;
            }
            var existing = assignments.findByJudgeAndSubmission(judge, submission);
            if (existing.isEmpty()) {
                continue;
            }
            if (evaluations.findByAssignment(existing.get()).isPresent()) {
                blocked++;
            } else {
                assignments.delete(existing.get());
                removed++;
            }
        }
        return new int[] {added, removed, blocked};
    }

    private Long[] parsePair(String pair) {
        try {
            String[] parts = pair.split(":");
            return new Long[] {Long.valueOf(parts[0]), Long.valueOf(parts[1])};
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("Asignación no válida");
        }
    }

    private Submission submissionOf(Competition competition, Long submissionId) {
        return submissions.findById(submissionId)
                .filter(s -> s.getCompetition().getId().equals(competition.getId()))
                .orElseThrow(() -> new IllegalArgumentException("El trabajo no pertenece a este concurso"));
    }

    private boolean addAssignment(Submission submission, Long judgeId) {
        AppUser judge = users.findById(judgeId)
                .filter(u -> u.getRole() == Role.JUDGE && u.isActive())
                .orElseThrow(() -> new IllegalArgumentException("Jurado no válido"));
        if (assignments.findByJudgeAndSubmission(judge, submission).isPresent()) {
            return false;
        }
        JudgeAssignment assignment = new JudgeAssignment();
        assignment.setSubmission(submission);
        assignment.setJudge(judge);
        assignments.save(assignment);
        return true;
    }
}
