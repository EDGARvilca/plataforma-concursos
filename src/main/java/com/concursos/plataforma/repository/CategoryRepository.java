package com.concursos.plataforma.repository;
import com.concursos.plataforma.model.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface CategoryRepository extends JpaRepository<Category,Long>{List<Category> findByCompetitionOrderByName(Competition competition);}
