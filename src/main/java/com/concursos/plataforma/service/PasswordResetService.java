package com.concursos.plataforma.service;

import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.model.PasswordResetToken;
import com.concursos.plataforma.repository.AppUserRepository;
import com.concursos.plataforma.repository.PasswordResetTokenRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PasswordResetService {

    private static final int TOKEN_VALID_MINUTES = 30;

    private final AppUserRepository users;
    private final PasswordResetTokenRepository tokens;
    private final PasswordEncoder encoder;

    public PasswordResetService(AppUserRepository users, PasswordResetTokenRepository tokens, PasswordEncoder encoder) {
        this.users = users;
        this.tokens = tokens;
        this.encoder = encoder;
    }

    /**
     * Creates a reset token for the given email, if it belongs to a registered user.
     * Returns empty when the email is unknown so the controller can show the same
     * generic confirmation either way and avoid leaking which emails are registered.
     */
    public Optional<String> requestReset(String email) {
        if (email == null || email.isBlank()) {
            return Optional.empty();
        }
        Optional<AppUser> userOptional = users.findByEmail(email.trim().toLowerCase());
        if (userOptional.isEmpty()) {
            return Optional.empty();
        }

        AppUser user = userOptional.get();
        tokens.findByUserAndUsedAtIsNull(user).forEach(existing -> existing.setUsedAt(LocalDateTime.now()));

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(UUID.randomUUID().toString());
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(TOKEN_VALID_MINUTES));
        tokens.save(resetToken);
        return Optional.of(resetToken.getToken());
    }

    @Transactional(readOnly = true)
    public AppUser validateToken(String token) {
        return requireValidToken(token).getUser();
    }

    public void resetPassword(String token, String newPassword, String confirmPassword) {
        PasswordResetToken resetToken = requireValidToken(token);
        if (newPassword == null || newPassword.length() < 8) {
            throw new IllegalArgumentException("La contraseña requiere al menos 8 caracteres");
        }
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Las contraseñas no coinciden");
        }

        AppUser user = resetToken.getUser();
        user.setPassword(encoder.encode(newPassword));
        users.save(user);
        resetToken.setUsedAt(LocalDateTime.now());
        tokens.save(resetToken);
    }

    private PasswordResetToken requireValidToken(String token) {
        PasswordResetToken resetToken = tokens.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("El enlace no es válido o ya fue utilizado"));
        if (!resetToken.isValid()) {
            throw new IllegalArgumentException("El enlace ha expirado. Solicita uno nuevo.");
        }
        return resetToken;
    }
}
