package com.concursos.plataforma.dto;

import java.time.LocalDateTime;

/** Una evaluación (o evaluación pendiente) de un jurado sobre un proyecto, para el seguimiento del organizador. */
public record EvaluationRow(String projectCode, String project, String category, String judge,
                            String status, Double score, LocalDateTime submittedAt) {
}
