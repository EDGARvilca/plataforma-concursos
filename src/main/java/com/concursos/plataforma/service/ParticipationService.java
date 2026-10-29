package com.concursos.plataforma.service;

import com.concursos.plataforma.dto.StoredFile;
import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.model.Category;
import com.concursos.plataforma.model.Competition;
import com.concursos.plataforma.model.CompetitionStatus;
import com.concursos.plataforma.model.Role;
import com.concursos.plataforma.model.Submission;
import com.concursos.plataforma.repository.CategoryRepository;
import com.concursos.plataforma.repository.CompetitionRepository;
import com.concursos.plataforma.repository.SubmissionRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class ParticipationService {

    private final CompetitionRepository competitions;
    private final CategoryRepository categories;
    private final SubmissionRepository submissions;
    private final FileStorageService storage;

    public ParticipationService(CompetitionRepository competitions, CategoryRepository categories, SubmissionRepository submissions, FileStorageService storage) {
        this.competitions = competitions; this.categories = categories; this.submissions = submissions; this.storage = storage;
    }

    @Transactional(readOnly = true)
    public List<Competition> openCompetitions() {
        return competitions.findByStatusOrderByEndDateAsc(CompetitionStatus.OPEN).stream().filter(this::acceptsSubmissions).toList();
    }

    @Transactional(readOnly = true)
    public List<Submission> submissionsFor(AppUser participant) { return submissions.findByParticipantOrderByIdDesc(participant); }

    @Transactional(readOnly = true)
    public Optional<Submission> findSubmission(AppUser participant, Competition competition) { return submissions.findByParticipantAndCompetition(participant, competition); }

    @Transactional(readOnly = true)
    public Competition getOpen(Long id) {
        Competition competition = competitions.findById(id).orElseThrow(() -> new IllegalArgumentException("Convocatoria no encontrada"));
        if (!acceptsSubmissions(competition)) throw new IllegalArgumentException("Esta convocatoria no está recibiendo trabajos");
        return competition;
    }

    public Submission submit(Long competitionId, Long categoryId, String title, String summary, String participantNames, String institutionGrade, MultipartFile file, AppUser participant) {
        if (participant.getRole() != Role.PARTICIPANT) throw new IllegalArgumentException("Solo los participantes pueden postular trabajos");
        Competition competition = getOpen(competitionId);
        Submission submission = submissions.findByParticipantAndCompetition(participant, competition).orElseGet(Submission::new);
        Category category = categoryId == null ? null : categories.findById(categoryId).filter(c -> c.getCompetition().getId().equals(competitionId) && c.isActive()).orElseThrow(() -> new IllegalArgumentException("Categoría no válida"));
        if (title == null || title.isBlank()) throw new IllegalArgumentException("El título es obligatorio");
        if (participantNames == null || participantNames.isBlank()) throw new IllegalArgumentException("Indica los integrantes del trabajo");
        if (submission.getId() == null && competition.getMaxProjects() != null && submissions.findByCompetitionOrderByIdDesc(competition).size() >= competition.getMaxProjects()) throw new IllegalArgumentException("Se alcanzó el cupo máximo de proyectos de esta convocatoria");
        submission.setInstitutionGrade(institutionGrade == null || institutionGrade.isBlank() ? null : institutionGrade.trim());
        submission.setCompetition(competition); submission.setParticipant(participant); submission.setCategory(category);
        submission.setTitle(title.trim()); submission.setSummary(summary == null ? null : summary.trim()); submission.setParticipantNames(participantNames.trim());
        if (file != null && !file.isEmpty()) {
            StoredFile stored = storage.store(file, "submissions");
            submission.setFileOriginalName(stored.originalName()); submission.setFileStoredName(stored.storedName()); submission.setFileContentType(stored.contentType()); submission.setFileSize(stored.size());
        } else if (!submission.hasFile()) {
            throw new IllegalArgumentException("Selecciona el archivo de tu trabajo");
        }
        submission.setSubmittedAt(LocalDateTime.now());
        return submissions.save(submission);
    }

    /** Reemplaza el archivo del proyecto mientras la convocatoria siga recibiendo trabajos. */
    public Submission updateFile(Long submissionId, MultipartFile file, AppUser participant) {
        Submission submission = getOwned(submissionId, participant);
        if (!acceptsSubmissions(submission.getCompetition())) throw new IllegalArgumentException("La convocatoria ya no permite actualizar archivos");
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Selecciona el nuevo archivo");
        StoredFile stored = storage.store(file, "submissions");
        submission.setFileOriginalName(stored.originalName()); submission.setFileStoredName(stored.storedName()); submission.setFileContentType(stored.contentType()); submission.setFileSize(stored.size());
        submission.setSubmittedAt(LocalDateTime.now());
        return submissions.save(submission);
    }

    @Transactional(readOnly = true)
    public Submission getOwned(Long id, AppUser participant) {
        Submission submission = getSubmission(id);
        if (submission.getParticipant() == null || !submission.getParticipant().getId().equals(participant.getId())) throw new IllegalArgumentException("No tienes permiso para ver este proyecto");
        return submission;
    }

    @Transactional(readOnly = true)
    public Resource basesFile(Competition competition) { return storage.load("bases", competition.getBasesStoredName()); }

    @Transactional(readOnly = true)
    public Submission getSubmission(Long id) { return submissions.findById(id).orElseThrow(() -> new IllegalArgumentException("Trabajo no encontrado")); }

    @Transactional(readOnly = true)
    public Resource submissionFile(Submission submission) { return storage.load("submissions", submission.getFileStoredName()); }

    private boolean acceptsSubmissions(Competition competition) {
        return competition.getStatus() == CompetitionStatus.OPEN && (competition.getEndDate() == null || !competition.getEndDate().isBefore(LocalDate.now()));
    }
}
