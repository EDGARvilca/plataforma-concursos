package com.concursos.plataforma.dto;

/** Resumen de configuración de un concurso (wireframe WF05). */
public record ConfigChecklist(
        int categories,
        double rubricWeight,
        int projects,
        int assignments,
        int requiredJudges,
        boolean everyProjectCovered) {

    public boolean categoriesOk() { return categories > 0; }
    public boolean rubricOk() { return Math.abs(rubricWeight - 100.0) < 0.01; }
    public boolean judgesOk() { return projects > 0 && everyProjectCovered; }
    public boolean projectsOk() { return projects > 0; }
}
