package com.concursos.plataforma.repository;
import com.concursos.plataforma.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface EvaluationScoreRepository extends JpaRepository<EvaluationScore,Long>{List<EvaluationScore> findByEvaluation(Evaluation evaluation); Optional<EvaluationScore> findByEvaluationAndCriterion(Evaluation evaluation,RubricCriterion criterion);}
