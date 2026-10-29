package com.concursos.plataforma.repository;
import com.concursos.plataforma.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface RubricCriterionRepository extends JpaRepository<RubricCriterion,Long>{List<RubricCriterion> findByCompetitionOrderById(Competition competition);}
