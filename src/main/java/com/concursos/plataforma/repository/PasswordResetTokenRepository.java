package com.concursos.plataforma.repository;
import com.concursos.plataforma.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken,Long>{
 Optional<PasswordResetToken> findByToken(String token);
 List<PasswordResetToken> findByUserAndUsedAtIsNull(AppUser user);
}
