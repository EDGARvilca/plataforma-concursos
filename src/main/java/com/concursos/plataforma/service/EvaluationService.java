package com.concursos.plataforma.service;

import com.concursos.plataforma.dto.CompetitionProgress;
import com.concursos.plataforma.dto.RankingRow;
import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.model.Competition;
import com.concursos.plataforma.model.Evaluation;
import com.concursos.plataforma.model.EvaluationScore;
import com.concursos.plataforma.model.JudgeAssignment;
import com.concursos.plataforma.model.RubricCriterion;
import com.concursos.plataforma.model.Submission;
import com.concursos.plataforma.repository.EvaluationRepository;
import com.concursos.plataforma.repository.EvaluationScoreRepository;
import com.concursos.plataforma.repository.JudgeAssignmentRepository;
import com.concursos.plataforma.repository.RubricCriterionRepository;
import com.concursos.plataforma.repository.SubmissionRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EvaluationService {

    private final JudgeAssignmentRepository assignments;
    private final EvaluationRepository evaluations;
    private final EvaluationScoreRepository scores;
    private final RubricCriterionRepository criteria;
    private final SubmissionRepository submissions;

    public EvaluationService(
            JudgeAssignmentRepository assignments,
            EvaluationRepository evaluations,
            EvaluationScoreRepository scores,
            RubricCriterionRepository criteria,
            SubmissionRepository submissions) {
        this.assignments = assignments;
        this.evaluations = evaluations;
        this.scores = scores;
        this.criteria = criteria;
        this.submissions = submissions;
    }

    @Transactional(readOnly = true)
    public List<JudgeAssignment> assignmentsFor(AppUser judge) {
        return assignments.findByJudgeOrderByIdDesc(judge);
    }

    @Transactional(readOnly = true)
    public JudgeAssignment getAssignment(Long id, AppUser judge) {
        JudgeAssignment assignment = assignments.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asignación no encontrada"));
        if (!assignment.getJudge().getId().equals(judge.getId())) {
            throw new IllegalArgumentException("No tiene acceso a esta evaluación");
        }
        return assignment;
    }

    @Transactional(readOnly = true)
    public List<RubricCriterion> criteriaFor(JudgeAssignment assignment) {
        return criteria.findByCompetitionOrderById(assignment.getSubmission().getCompetition());
    }

    @Transactional(readOnly = true)
    public Optional<Evaluation> findEvaluation(JudgeAssignment assignment) {
        return evaluations.findByAssignment(assignment);
    }

    @Transactional(readOnly = true)
    public Map<Long, Double> scoreMap(Evaluation evaluation) {
        Map<Long, Double> values = new HashMap<>();
        scores.findByEvaluation(evaluation).forEach(score -> values.put(score.getCriterion().getId(), score.getScore()));
        return values;
    }

    @Transactional(readOnly = true)
    public Map<Long, Boolean> submissionStatusFor(AppUser judge) {
        Map<Long, Boolean> status = new LinkedHashMap<>();
        for (JudgeAssignment assignment : assignmentsFor(judge)) {
            status.put(
                    assignment.getId(),
                    findEvaluation(assignment).map(Evaluation::isSubmitted).orElse(false));
        }
        return status;
    }

    /**
     * Comprueba que todos los criterios tengan puntaje y que esté dentro del rango permitido.
     * Se usa antes de mostrar la confirmación y antes de enviar la evaluación definitiva.
     */
    @Transactional(readOnly = true)
    public void validateComplete(JudgeAssignment assignment, Map<Long, Double> values) {
        for (RubricCriterion criterion : criteriaFor(assignment)) {
            Double value = values.get(criterion.getId());
            if (value == null) {
                throw new IllegalArgumentException("Debe completar todos los criterios");
            }
            if (value < 0 || value > criterion.getMaxScore()) {
                throw new IllegalArgumentException("Puntaje fuera de rango en: " + criterion.getName());
            }
        }
    }

    /** Puntaje ponderado (0 a 100) con la misma fórmula del ranking: Σ((puntaje/máximo)×peso) / Σpesos × 100. */
    @Transactional(readOnly = true)
    public double weightedPercent(JudgeAssignment assignment, Map<Long, Double> values) {
        return weightedFor(criteriaFor(assignment), values);
    }

    /** Guarda la evaluación como borrador: acepta criterios incompletos y no la marca como enviada. */
    public void saveDraft(JudgeAssignment assignment, String comments, Map<Long, Double> values) {
        Optional<Evaluation> existing = evaluations.findByAssignment(assignment);
        if (existing.isPresent() && existing.get().isSubmitted()) {
            throw new IllegalArgumentException("La evaluación ya fue enviada y no puede volver a borrador");
        }
        Evaluation evaluation = existing.orElseGet(() -> {
            Evaluation newEvaluation = new Evaluation();
            newEvaluation.setAssignment(assignment);
            return evaluations.save(newEvaluation);
        });

        for (RubricCriterion criterion : criteriaFor(assignment)) {
            Double value = values.get(criterion.getId());
            if (value == null) {
                continue;
            }
            if (value < 0 || value > criterion.getMaxScore()) {
                throw new IllegalArgumentException("Puntaje fuera de rango en: " + criterion.getName());
            }
            saveScore(evaluation, criterion, value);
        }

        evaluation.setComments(comments == null ? null : comments.trim());
        evaluations.save(evaluation);
    }

    public void submit(JudgeAssignment assignment, String comments, Map<Long, Double> values) {
        validateComplete(assignment, values);
        Evaluation evaluation = evaluations.findByAssignment(assignment).orElseGet(() -> {
            Evaluation newEvaluation = new Evaluation();
            newEvaluation.setAssignment(assignment);
            return evaluations.save(newEvaluation);
        });

        for (RubricCriterion criterion : criteriaFor(assignment)) {
            saveScore(evaluation, criterion, values.get(criterion.getId()));
        }

        evaluation.setComments(comments == null ? null : comments.trim());
        evaluation.setSubmittedAt(LocalDateTime.now());
        evaluations.save(evaluation);
    }

    private void saveScore(Evaluation evaluation, RubricCriterion criterion, Double value) {
        EvaluationScore score = scores.findByEvaluationAndCriterion(evaluation, criterion)
                .orElseGet(EvaluationScore::new);
        score.setEvaluation(evaluation);
        score.setCriterion(criterion);
        score.setScore(value);
        scores.save(score);
    }

    /** Estado de una asignación: Pendiente, Borrador o Enviada. */
    @Transactional(readOnly = true)
    public String assignmentState(JudgeAssignment assignment) {
        return evaluations.findByAssignment(assignment)
                .map(evaluation -> evaluation.isSubmitted() ? "Enviada" : "Borrador")
                .orElse("Pendiente");
    }

    /** Estado global de un proyecto: Inscrito, Evaluando o Evaluado. */
    @Transactional(readOnly = true)
    public String projectState(Submission submission) {
        List<JudgeAssignment> list = assignments.findBySubmission(submission);
        long sent = list.stream()
                .filter(a -> evaluations.findByAssignment(a).map(Evaluation::isSubmitted).orElse(false))
                .count();
        if (list.isEmpty() || sent == 0) {
            return "Inscrito";
        }
        return sent >= list.size() ? "Evaluado" : "Evaluando";
    }

    /** Seguimiento de evaluaciones de un concurso: una fila por cada asignación jurado-proyecto. */
    @Transactional(readOnly = true)
    public List<com.concursos.plataforma.dto.EvaluationRow> evaluationRows(Competition competition) {
        List<RubricCriterion> rubric = criteria.findByCompetitionOrderById(competition);
        List<com.concursos.plataforma.dto.EvaluationRow> rows = new ArrayList<>();
        for (Submission submission : submissions.findByCompetitionOrderByIdDesc(competition)) {
            for (JudgeAssignment assignment : assignments.findBySubmission(submission)) {
                Optional<Evaluation> evaluation = evaluations.findByAssignment(assignment);
                String state = evaluation.map(e -> e.isSubmitted() ? "Enviada" : "Borrador").orElse("Pendiente");
                Double score = null;
                if (evaluation.isPresent() && evaluation.get().isSubmitted()) {
                    score = weightedFor(rubric, scoreMap(evaluation.get()));
                }
                rows.add(new com.concursos.plataforma.dto.EvaluationRow(
                        submission.getCode(),
                        submission.getTitle(),
                        submission.getCategory() == null ? "Sin categoría" : submission.getCategory().getName(),
                        assignment.getJudge().getFullName(),
                        state,
                        score,
                        evaluation.map(Evaluation::getSubmittedAt).orElse(null)));
            }
        }
        return rows;
    }

    private double weightedFor(List<RubricCriterion> rubric, Map<Long, Double> values) {
        double totalWeight = rubric.stream().mapToDouble(RubricCriterion::getWeight).sum();
        if (totalWeight <= 0) {
            return 0.0;
        }
        double weighted = 0;
        for (RubricCriterion criterion : rubric) {
            double score = values.getOrDefault(criterion.getId(), 0.0);
            weighted += (criterion.getMaxScore() > 0 ? score / criterion.getMaxScore() : 0) * criterion.getWeight();
        }
        return Math.round(weighted / totalWeight * 1000.0) / 10.0;
    }

    @Transactional(readOnly = true)
    public CompetitionProgress progress(Competition competition) {
        List<Submission> projectList = submissions.findByCompetitionOrderByIdDesc(competition);
        long assignmentCount = 0;
        long submittedCount = 0;

        for (Submission project : projectList) {
            List<JudgeAssignment> projectAssignments = assignments.findBySubmission(project);
            assignmentCount += projectAssignments.size();
            for (JudgeAssignment assignment : projectAssignments) {
                if (evaluations.findByAssignment(assignment).map(Evaluation::isSubmitted).orElse(false)) {
                    submittedCount++;
                }
            }
        }

        double percentage = assignmentCount == 0 ? 0.0 : (submittedCount * 100.0 / assignmentCount);
        double rubricWeight = criteria.findByCompetitionOrderById(competition).stream()
                .mapToDouble(RubricCriterion::getWeight)
                .sum();

        return new CompetitionProgress(
                projectList.size(),
                assignmentCount,
                submittedCount,
                Math.round(percentage * 10.0) / 10.0,
                Math.round(rubricWeight * 10.0) / 10.0);
    }

    @Transactional(readOnly = true)
    public List<String> feedbackFor(Submission submission) {
        List<String> feedback = new ArrayList<>();
        for (JudgeAssignment assignment : assignments.findBySubmission(submission)) {
            evaluations.findByAssignment(assignment)
                    .filter(Evaluation::isSubmitted)
                    .map(Evaluation::getComments)
                    .filter(comments -> comments != null && !comments.isBlank())
                    .ifPresent(feedback::add);
        }
        return feedback;
    }

    @Transactional(readOnly = true)
    public List<RankingRow> ranking(Competition competition) {
        List<RubricCriterion> rubric = criteria.findByCompetitionOrderById(competition);
        double totalWeightRaw = rubric.stream().mapToDouble(RubricCriterion::getWeight).sum();
        final double totalWeight = totalWeightRaw <= 0 ? 1.0 : totalWeightRaw;
        List<RankingRow> rows = new ArrayList<>();

        for (Submission submission : submissions.findByCompetitionOrderByIdDesc(competition)) {
            List<Double> totals = new ArrayList<>();
            long submittedEvaluations = 0;

            List<JudgeAssignment> submissionAssignments = assignments.findBySubmission(submission);
            for (JudgeAssignment assignment : submissionAssignments) {
                Optional<Evaluation> evaluationOptional = evaluations.findByAssignment(assignment);
                if (evaluationOptional.isEmpty() || !evaluationOptional.get().isSubmitted()) {
                    continue;
                }

                submittedEvaluations++;
                Map<Long, Double> scoreMap = scoreMap(evaluationOptional.get());
                double weightedScore = 0;

                for (RubricCriterion criterion : rubric) {
                    double score = scoreMap.getOrDefault(criterion.getId(), 0.0);
                    weightedScore += (criterion.getMaxScore() > 0 ? score / criterion.getMaxScore() : 0)
                            * criterion.getWeight();
                }
                totals.add((weightedScore / totalWeight) * 100);
            }

            double finalScore = totals.stream().mapToDouble(Double::doubleValue).average().orElse(0);
            rows.add(new RankingRow(
                    submission.getId(),
                    submission.getTitle(),
                    submission.getParticipantNames(),
                    submission.getCategory() == null ? "Sin categoría" : submission.getCategory().getName(),
                    submittedEvaluations,
                    submissionAssignments.size(),
                    Math.round(finalScore * 100.0) / 100.0));
        }

        rows.sort(Comparator.comparingDouble(RankingRow::score).reversed());
        return rows;
    }
}
