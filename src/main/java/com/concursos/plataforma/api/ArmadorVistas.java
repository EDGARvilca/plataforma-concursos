package com.concursos.plataforma.api;

import com.concursos.plataforma.api.Vistas.ProyectoVista;
import com.concursos.plataforma.model.Submission;
import com.concursos.plataforma.service.CompetitionService;
import com.concursos.plataforma.service.EvaluationService;
import java.util.List;
import org.springframework.stereotype.Component;

/** Arma las vistas que necesitan datos de varios servicios (estado del proyecto, jurados asignados). */
@Component
public class ArmadorVistas {

    private final EvaluationService evaluaciones;
    private final CompetitionService concursos;

    public ArmadorVistas(EvaluationService evaluaciones, CompetitionService concursos) {
        this.evaluaciones = evaluaciones;
        this.concursos = concursos;
    }

    public ProyectoVista proyecto(Submission proyecto) {
        return Vistas.proyecto(proyecto, evaluaciones.projectState(proyecto), concursos.assignmentsOf(proyecto).size());
    }

    public List<ProyectoVista> proyectos(List<Submission> lista) {
        return lista.stream().map(this::proyecto).toList();
    }
}
