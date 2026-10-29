package com.concursos.plataforma.config;

import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.model.Category;
import com.concursos.plataforma.model.Competition;
import com.concursos.plataforma.model.CompetitionStatus;
import com.concursos.plataforma.model.Institution;
import com.concursos.plataforma.model.JudgeAssignment;
import com.concursos.plataforma.model.Role;
import com.concursos.plataforma.model.RubricCriterion;
import com.concursos.plataforma.model.Submission;
import com.concursos.plataforma.repository.AppUserRepository;
import com.concursos.plataforma.repository.CategoryRepository;
import com.concursos.plataforma.repository.CompetitionRepository;
import com.concursos.plataforma.repository.InstitutionRepository;
import com.concursos.plataforma.repository.JudgeAssignmentRepository;
import com.concursos.plataforma.repository.RubricCriterionRepository;
import com.concursos.plataforma.repository.SubmissionRepository;
import java.time.LocalDate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(
            AppUserRepository users,
            CompetitionRepository competitions,
            CategoryRepository categories,
            RubricCriterionRepository criteria,
            SubmissionRepository submissions,
            JudgeAssignmentRepository assignments,
            InstitutionRepository institutions,
            PasswordEncoder encoder) {

        return args -> {
            if (institutions.count() == 0) {
                institutions.save(institution("Universidad Nacional de Educación", "Lima"));
                institutions.save(institution("Colegio Santa Rosa", "Lima"));
                institutions.save(institution("Instituto Tecnológico del Norte", "Trujillo"));
            }
            if (users.count() > 0) {
                return;
            }

            users.save(new AppUser("Administrador Demo", "admin@demo.pe", encoder.encode("Admin123*"), Role.ADMIN));
            AppUser organizer = users.save(new AppUser("Coordinador Demo", "organizador@demo.pe", encoder.encode("Org123*"), Role.ORGANIZER));
            AppUser judge1 = users.save(new AppUser("Jurado Uno", "jurado@demo.pe", encoder.encode("Jurado123*"), Role.JUDGE));
            AppUser judge2 = users.save(new AppUser("Jurado Dos", "jurado2@demo.pe", encoder.encode("Jurado123*"), Role.JUDGE));
            AppUser judge3 = users.save(new AppUser("Jurado Tres", "jurado3@demo.pe", encoder.encode("Jurado123*"), Role.JUDGE));
            AppUser participante = users.save(new AppUser("Participante Demo", "participante@demo.pe", encoder.encode("Part123*"), Role.PARTICIPANT));

            Competition competition = new Competition();
            competition.setName("Feria de Innovación 2026");
            competition.setDescription("Evento demostrativo para gestionar proyectos, jurados, rúbricas, evaluaciones y resultados en un único flujo digital.");
            competition.setStartDate(LocalDate.now().minusDays(5));
            competition.setEndDate(LocalDate.now().plusDays(30));
            competition.setStatus(CompetitionStatus.EVALUATION);
            competition.setOrganizer(organizer);
            competition.setType("Tecnología e innovación");
            competition.setMaxProjects(150);
            competition.setMinJudges(2);
            competition.setConditions("Trabajos originales, en equipos de hasta 4 integrantes. Archivo en PDF de máximo 10 MB.");
            competitions.save(competition);

            Category research = saveCategory(categories, competition, "Investigación", "Proyectos de indagación e investigación aplicada.");
            Category innovation = saveCategory(categories, competition, "Innovación tecnológica", "Soluciones, prototipos y productos tecnológicos.");
            Category entrepreneurship = saveCategory(categories, competition, "Emprendimiento", "Propuestas con potencial de impacto y sostenibilidad.");

            criteria.save(criterion(competition, "Problema y objetivos", "Claridad, pertinencia y coherencia del problema planteado.", 20.0, 25.0));
            criteria.save(criterion(competition, "Metodología", "Rigor del procedimiento, evidencias y trazabilidad del trabajo.", 20.0, 25.0));
            criteria.save(criterion(competition, "Innovación e impacto", "Originalidad, utilidad, viabilidad e impacto de la propuesta.", 20.0, 30.0));
            criteria.save(criterion(competition, "Presentación", "Claridad de resultados, conclusiones y comunicación del proyecto.", 20.0, 20.0));

            Submission s1 = submissions.save(submission(competition, research, "Filtro ecológico de agua", "Sistema de purificación con materiales de bajo costo y evaluación de parámetros básicos de calidad.", "Ana Pérez / Luis Torres"));
            Submission s2 = submissions.save(submission(competition, innovation, "Sensor de alerta vial", "Prototipo de advertencia de proximidad vehicular orientado a prevención de accidentes.", "María Soto / Diego Ramos"));
            Submission s3 = submissions.save(submission(competition, entrepreneurship, "BioMaceta circular", "Maceta biodegradable elaborada con residuos orgánicos y propuesta de comercialización escolar.", "Camila Rojas / André León"));
            Submission s4 = submissions.save(submission(competition, innovation, "Riego inteligente escolar", "Sistema de riego automatizado con sensores de humedad para áreas verdes educativas.", "Lucía Flores / Mateo Ruiz"));

            s1.setParticipant(participante);
            submissions.save(s1);

            assign(assignments, judge1, s1);
            assign(assignments, judge2, s1);
            assign(assignments, judge1, s2);
            assign(assignments, judge3, s2);
            assign(assignments, judge2, s3);
            assign(assignments, judge3, s3);
            assign(assignments, judge1, s4);
            assign(assignments, judge2, s4);

            System.out.println("==========================================");
            System.out.println("DATOS DEMO CARGADOS CORRECTAMENTE");
            System.out.println("==========================================");
        };
    }

    private Institution institution(String name, String city) {
        Institution institution = new Institution();
        institution.setName(name);
        institution.setCity(city);
        institution.setActive(true);
        return institution;
    }

    private Category saveCategory(CategoryRepository repository, Competition competition, String name, String description) {
        Category category = new Category();
        category.setCompetition(competition);
        category.setName(name);
        category.setDescription(description);
        return repository.save(category);
    }

    private RubricCriterion criterion(Competition competition, String name, String description, Double maxScore, Double weight) {
        RubricCriterion criterion = new RubricCriterion();
        criterion.setCompetition(competition);
        criterion.setName(name);
        criterion.setDescription(description);
        criterion.setMaxScore(maxScore);
        criterion.setWeight(weight);
        return criterion;
    }

    private Submission submission(Competition competition, Category category, String title, String summary, String participants) {
        Submission submission = new Submission();
        submission.setCompetition(competition);
        submission.setCategory(category);
        submission.setTitle(title);
        submission.setSummary(summary);
        submission.setParticipantNames(participants);
        submission.setSubmittedAt(java.time.LocalDateTime.now().minusDays(2));
        return submission;
    }

    private void assign(JudgeAssignmentRepository repository, AppUser judge, Submission submission) {
        JudgeAssignment assignment = new JudgeAssignment();
        assignment.setJudge(judge);
        assignment.setSubmission(submission);
        repository.save(assignment);
    }
}
