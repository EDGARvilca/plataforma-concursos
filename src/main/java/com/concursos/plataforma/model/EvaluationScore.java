package com.concursos.plataforma.model;
import jakarta.persistence.*;
@Entity @Table(name="evaluation_scores",uniqueConstraints=@UniqueConstraint(columnNames={"evaluation_id","criterion_id"}))
public class EvaluationScore {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="evaluation_id") private Evaluation evaluation; @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="criterion_id") private RubricCriterion criterion; @Column(nullable=false) private Double score;
 public Long getId(){return id;} public Evaluation getEvaluation(){return evaluation;} public void setEvaluation(Evaluation v){evaluation=v;} public RubricCriterion getCriterion(){return criterion;} public void setCriterion(RubricCriterion v){criterion=v;} public Double getScore(){return score;} public void setScore(Double v){score=v;}
}
