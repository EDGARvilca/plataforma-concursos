package com.concursos.plataforma.dto;

/** Indicadores del dashboard del organizador (wireframe WF02). */
public record DashboardStats(
        long competitions,
        long activeCompetitions,
        long projects,
        long judges,
        long submittedEvaluations,
        long totalAssignments) {

    /** Porcentaje de evaluaciones enviadas sobre las asignadas. */
    public double evaluationProgress() {
        return totalAssignments == 0 ? 0.0 : Math.round(submittedEvaluations * 1000.0 / totalAssignments) / 10.0;
    }
}
