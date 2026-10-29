package com.concursos.plataforma.model;
import jakarta.persistence.*;
@Entity @Table(name="categories")
public class Category {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String name; private String description;
 /** Nullable: las categorías anteriores a este campo se consideran activas. */
 private Boolean active;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="competition_id") private Competition competition;
 public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;} public Competition getCompetition(){return competition;} public void setCompetition(Competition v){competition=v;}
 public boolean isActive(){return active==null||active;} public void setActive(boolean v){active=v;}
}
