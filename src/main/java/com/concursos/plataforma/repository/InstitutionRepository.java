package com.concursos.plataforma.repository;

import com.concursos.plataforma.model.Institution;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InstitutionRepository extends JpaRepository<Institution, Long> {
    List<Institution> findAllByOrderByName();
    Optional<Institution> findByNameIgnoreCase(String name);
}
