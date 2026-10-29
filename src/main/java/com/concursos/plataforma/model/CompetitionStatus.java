package com.concursos.plataforma.model;
public enum CompetitionStatus {
  DRAFT("Borrador"), OPEN("Inscripciones abiertas"), EVALUATION("En evaluación"), CLOSED("Cerrado");
  private final String label;
  CompetitionStatus(String label){this.label=label;}
  public String getLabel(){return label;}
}
