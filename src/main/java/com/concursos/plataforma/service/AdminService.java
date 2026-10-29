package com.concursos.plataforma.service;

import com.concursos.plataforma.dto.ActivityItem;
import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.model.Institution;
import com.concursos.plataforma.model.Role;
import com.concursos.plataforma.model.Submission;
import com.concursos.plataforma.repository.AppUserRepository;
import com.concursos.plataforma.repository.InstitutionRepository;
import com.concursos.plataforma.repository.SubmissionRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminService {
    private final AppUserRepository users;
    private final InstitutionRepository institutions;
    private final SubmissionRepository submissions;
    private final PasswordEncoder encoder;

    public AdminService(AppUserRepository users, InstitutionRepository institutions, SubmissionRepository submissions, PasswordEncoder encoder) {
        this.users = users;
        this.institutions = institutions;
        this.submissions = submissions;
        this.encoder = encoder;
    }

    // ------------------------------------------------------------------
    // Usuarios
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<AppUser> users() {
        return users.findAll().stream().sorted(Comparator.comparing(AppUser::getFullName)).toList();
    }

    public AppUser create(String name, String email, String password, Role role, Long institutionId, boolean active) {
        if (name == null || name.isBlank() || email == null || email.isBlank() || role == null || password == null || password.length() < 8) {
            throw new IllegalArgumentException("Completa los datos; la contraseña requiere al menos 8 caracteres");
        }
        if (users.findByEmail(email.trim().toLowerCase()).isPresent()) {
            throw new IllegalArgumentException("El correo ya está registrado");
        }
        AppUser user = new AppUser(name.trim(), email.trim().toLowerCase(), encoder.encode(password), role);
        user.setInstitution(institution(institutionId));
        user.setActive(active);
        return users.save(user);
    }

    public AppUser update(Long id, String name, String email, Role role, String password, String authenticatedEmail,
                          Long institutionId, boolean active) {
        if (name == null || name.isBlank() || email == null || email.isBlank() || role == null) {
            throw new IllegalArgumentException("Nombre, correo y rol son obligatorios");
        }
        AppUser user = users.findById(id).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        String normalizedEmail = email.trim().toLowerCase();
        boolean ownAccount = user.getEmail().equalsIgnoreCase(authenticatedEmail);
        if (ownAccount && (!user.getEmail().equals(normalizedEmail) || user.getRole() != role)) {
            throw new IllegalArgumentException("Por seguridad, no puedes cambiar el correo ni el rol de tu sesión actual");
        }
        if (ownAccount && !active) {
            throw new IllegalArgumentException("No puedes desactivar tu propia cuenta");
        }
        if (user.getRole() == Role.ADMIN && (role != Role.ADMIN || !active) && users.countByRole(Role.ADMIN) <= 1) {
            throw new IllegalArgumentException("Debe existir al menos un administrador activo");
        }
        users.findByEmail(normalizedEmail).filter(other -> !other.getId().equals(id))
                .ifPresent(other -> { throw new IllegalArgumentException("El correo ya está registrado"); });
        user.setFullName(name.trim());
        user.setEmail(normalizedEmail);
        user.setRole(role);
        user.setInstitution(institution(institutionId));
        user.setActive(active);
        if (password != null && !password.isBlank()) {
            if (password.length() < 8) throw new IllegalArgumentException("La contraseña requiere al menos 8 caracteres");
            user.setPassword(encoder.encode(password));
        }
        return users.save(user);
    }

    @Transactional(readOnly = true)
    public long countByRole(Role role) {
        return users.countByRole(role);
    }

    /** Eventos recientes (altas de proyectos) para el dashboard del administrador. */
    @Transactional(readOnly = true)
    public List<ActivityItem> recentActivity(int limit) {
        List<ActivityItem> items = new ArrayList<>();
        for (Submission submission : submissions.findAll()) {
            if (submission.getSubmittedAt() != null) {
                items.add(new ActivityItem("Proyecto «" + submission.getTitle() + "» recibido en " + submission.getCompetition().getName(), submission.getSubmittedAt()));
            }
        }
        items.sort(Comparator.comparing(ActivityItem::at, Comparator.nullsLast(Comparator.<LocalDateTime>reverseOrder())));
        return items.stream().limit(limit).toList();
    }

    // ------------------------------------------------------------------
    // Instituciones
    // ------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<Institution> institutions() {
        return institutions.findAllByOrderByName();
    }

    @Transactional(readOnly = true)
    public List<Institution> activeInstitutions() {
        return institutions.findAllByOrderByName().stream().filter(Institution::isActive).toList();
    }

    public Institution saveInstitution(Long id, String name, String city, boolean active) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("El nombre de la institución es obligatorio");
        String clean = name.trim();
        institutions.findByNameIgnoreCase(clean).filter(other -> !other.getId().equals(id))
                .ifPresent(other -> { throw new IllegalArgumentException("Ya existe una institución con ese nombre"); });
        Institution institution = id == null ? new Institution() : institutions.findById(id).orElseThrow(() -> new IllegalArgumentException("Institución no encontrada"));
        institution.setName(clean);
        institution.setCity(city == null || city.isBlank() ? null : city.trim());
        institution.setActive(active);
        return institutions.save(institution);
    }

    private Institution institution(Long id) {
        return id == null ? null : institutions.findById(id).orElseThrow(() -> new IllegalArgumentException("Institución no válida"));
    }
}
