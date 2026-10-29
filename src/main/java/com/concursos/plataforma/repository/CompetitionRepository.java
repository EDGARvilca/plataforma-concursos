package com.concursos.plataforma.repository;
import com.concursos.plataforma.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface CompetitionRepository extends JpaRepository<Competition,Long>{List<Competition> findByOrganizerOrderByIdDesc(AppUser organizer); List<Competition> findByStatusOrderByEndDateAsc(CompetitionStatus status);}
