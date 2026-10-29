package com.concursos.plataforma.repository;
import com.concursos.plataforma.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface AppUserRepository extends JpaRepository<AppUser,Long>{Optional<AppUser> findByEmail(String email); List<AppUser> findByRole(Role role); long countByRole(Role role);}
