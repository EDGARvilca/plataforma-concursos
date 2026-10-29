package com.concursos.plataforma.dto;

public record CompetitionProgress(
        long projects,
        long assignments,
        long submittedEvaluations,
        double evaluationProgress,
        double rubricWeight) {
}
