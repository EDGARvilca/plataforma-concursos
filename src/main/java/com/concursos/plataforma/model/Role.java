package com.concursos.plataforma.model;
public enum Role {
 ADMIN("Administrador"), ORGANIZER("Organizador"), JUDGE("Jurado"), PARTICIPANT("Participante");
 private final String label; Role(String label){this.label=label;} public String getLabel(){return label;}
}
