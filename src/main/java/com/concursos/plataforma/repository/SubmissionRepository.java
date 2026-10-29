package com.concursos.plataforma.repository;
import com.concursos.plataforma.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface SubmissionRepository extends JpaRepository<Submission,Long>{List<Submission> findByCompetitionOrderByIdDesc(Competition competition); List<Submission> findByParticipantOrderByIdDesc(AppUser participant); Optional<Submission> findByParticipantAndCompetition(AppUser participant,Competition competition);}
