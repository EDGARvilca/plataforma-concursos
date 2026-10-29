package com.concursos.plataforma.api;

import com.concursos.plataforma.api.Vistas.ConcursoVista;
import com.concursos.plataforma.api.Vistas.FilaRankingVista;
import com.concursos.plataforma.api.Vistas.ProgresoVista;
import com.concursos.plataforma.dto.RankingRow;
import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.model.Competition;
import com.concursos.plataforma.service.CompetitionService;
import com.concursos.plataforma.service.CurrentUserService;
import com.concursos.plataforma.service.EvaluationService;
import com.concursos.plataforma.service.ReportService;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Ranking final de un concurso y su exportación a Excel y PDF. */
@RestController
@RequestMapping("/api/resultados")
public class ControladorResultados {

    public record DatosResultados(ConcursoVista concurso, List<ConcursoVista> concursos,
                                  List<FilaRankingVista> ranking, ProgresoVista progreso) {
    }

    private final CompetitionService concursos;
    private final EvaluationService evaluaciones;
    private final ReportService reportes;
    private final CurrentUserService usuarioActual;

    public ControladorResultados(CompetitionService concursos, EvaluationService evaluaciones,
                                 ReportService reportes, CurrentUserService usuarioActual) {
        this.concursos = concursos;
        this.evaluaciones = evaluaciones;
        this.reportes = reportes;
        this.usuarioActual = usuarioActual;
    }

    @GetMapping("/{id}")
    public DatosResultados ver(@PathVariable Long id, Authentication autenticacion) {
        AppUser usuario = usuarioActual.require(autenticacion);
        Competition concurso = concursos.getManageable(id, usuario);
        List<RankingRow> ranking = evaluaciones.ranking(concurso);
        List<FilaRankingVista> filas = new ArrayList<>();
        for (int i = 0; i < ranking.size(); i++) {
            filas.add(Vistas.filaRanking(ranking.get(i), i + 1));
        }
        return new DatosResultados(Vistas.concurso(concurso),
                concursos.listFor(usuario).stream().map(Vistas::concurso).toList(),
                filas, Vistas.progreso(evaluaciones.progress(concurso)));
    }

    @GetMapping("/{id}/excel")
    public ResponseEntity<byte[]> exportarExcel(@PathVariable Long id, Authentication autenticacion) throws IOException {
        Competition concurso = concursos.getManageable(id, usuarioActual.require(autenticacion));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ranking-" + id + ".xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(reportes.rankingXlsx(concurso, evaluaciones.ranking(concurso)));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> exportarPdf(@PathVariable Long id, Authentication autenticacion) {
        Competition concurso = concursos.getManageable(id, usuarioActual.require(autenticacion));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ranking-" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(reportes.rankingPdf(concurso, evaluaciones.ranking(concurso)));
    }
}
