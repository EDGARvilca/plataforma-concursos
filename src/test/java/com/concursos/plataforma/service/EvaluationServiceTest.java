package com.concursos.plataforma.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.concursos.plataforma.dto.CompetitionProgress;
import com.concursos.plataforma.model.Competition;
import com.concursos.plataforma.model.Evaluation;
import com.concursos.plataforma.model.JudgeAssignment;
import com.concursos.plataforma.model.RubricCriterion;
import com.concursos.plataforma.model.Submission;
import com.concursos.plataforma.repository.EvaluationRepository;
import com.concursos.plataforma.repository.EvaluationScoreRepository;
import com.concursos.plataforma.repository.JudgeAssignmentRepository;
import com.concursos.plataforma.repository.RubricCriterionRepository;
import com.concursos.plataforma.repository.SubmissionRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EvaluationServiceTest {

    @Mock
    private JudgeAssignmentRepository assignments;

    @Mock
    private EvaluationRepository evaluations;

    @Mock
    private EvaluationScoreRepository scores;

    @Mock
    private RubricCriterionRepository criteria;

    @Mock
    private SubmissionRepository submissions;

    private EvaluationService evaluationService() {
        return new EvaluationService(assignments, evaluations, scores, criteria, submissions);
    }

    @Test
    void progressReturnsZeroPercentageWhenThereAreNoAssignments() {
        Competition competition = mock(Competition.class);
        Submission submission = mock(Submission.class);

        when(submissions.findByCompetitionOrderByIdDesc(competition)).thenReturn(List.of(submission));
        when(assignments.findBySubmission(submission)).thenReturn(List.of());
        when(criteria.findByCompetitionOrderById(competition)).thenReturn(List.of());

        CompetitionProgress progress = evaluationService().progress(competition);

        assertThat(progress.projects()).isEqualTo(1);
        assertThat(progress.assignments()).isEqualTo(0);
        assertThat(progress.submittedEvaluations()).isEqualTo(0);
        assertThat(progress.evaluationProgress()).isEqualTo(0.0);
        assertThat(progress.rubricWeight()).isEqualTo(0.0);
    }

    @Test
    void progressCalculatesPercentageOfSubmittedEvaluationsAndRubricWeight() {
        Competition competition = mock(Competition.class);
        Submission submission = mock(Submission.class);
        JudgeAssignment submittedAssignment = mock(JudgeAssignment.class);
        JudgeAssignment pendingAssignment = mock(JudgeAssignment.class);
        Evaluation submittedEvaluation = mock(Evaluation.class);

        RubricCriterion criterion = new RubricCriterion();
        criterion.setWeight(2.5);

        when(submissions.findByCompetitionOrderByIdDesc(competition)).thenReturn(List.of(submission));
        when(assignments.findBySubmission(submission))
                .thenReturn(List.of(submittedAssignment, pendingAssignment));
        when(evaluations.findByAssignment(submittedAssignment)).thenReturn(Optional.of(submittedEvaluation));
        when(submittedEvaluation.isSubmitted()).thenReturn(true);
        when(evaluations.findByAssignment(pendingAssignment)).thenReturn(Optional.empty());
        when(criteria.findByCompetitionOrderById(competition)).thenReturn(List.of(criterion));

        CompetitionProgress progress = evaluationService().progress(competition);

        assertThat(progress.assignments()).isEqualTo(2);
        assertThat(progress.submittedEvaluations()).isEqualTo(1);
        assertThat(progress.evaluationProgress()).isEqualTo(50.0);
        assertThat(progress.rubricWeight()).isEqualTo(2.5);
    }
}
