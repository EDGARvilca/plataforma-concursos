package com.concursos.plataforma.repository;
import com.concursos.plataforma.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface EvaluationRepository extends JpaRepository<Evaluation,Long>{Optional<Evaluation> findByAssignment(JudgeAssignment assignment);}
