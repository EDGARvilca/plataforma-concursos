package com.concursos.plataforma.model;
import jakarta.persistence.*;
@Entity @Table(name="rubric_criteria")
public class RubricCriterion {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String name; @Column(length=800) private String description;
 @Column(nullable=false) private Double maxScore=20.0; @Column(nullable=false) private Double weight=1.0;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="competition_id") private Competition competition;
 public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;} public Double getMaxScore(){return maxScore;} public void setMaxScore(Double v){maxScore=v;} public Double getWeight(){return weight;} public void setWeight(Double v){weight=v;} public Competition getCompetition(){return competition;} public void setCompetition(Competition v){competition=v;}
}
