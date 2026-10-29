package com.concursos.plataforma.repository;
import com.concursos.plataforma.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface JudgeAssignmentRepository extends JpaRepository<JudgeAssignment,Long>{List<JudgeAssignment> findByJudgeOrderByIdDesc(AppUser judge); List<JudgeAssignment> findBySubmission(Submission submission); Optional<JudgeAssignment> findByJudgeAndSubmission(AppUser judge,Submission submission);}
