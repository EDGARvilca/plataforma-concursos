package com.concursos.plataforma.dto;

/** Una fila del ranking: un proyecto con su puntaje promedio entre los jurados que ya evaluaron. */
public record RankingRow(Long submissionId, String title, String participants, String category,
                         long submittedEvaluations, long assignedJudges, double score) {

    /** Estado de la evaluación del proyecto, mostrado en la tabla del ranking. */
    public String status() {
        if (assignedJudges == 0) return "Sin jurados";
        if (submittedEvaluations == 0) return "Pendiente";
        return submittedEvaluations >= assignedJudges ? "Completo" : "Parcial";
    }
}
