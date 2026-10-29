package com.concursos.plataforma.model;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="submissions")
public class Submission {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false) private String title; @Column(length=1500) private String summary; @Column(nullable=false) private String participantNames;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="competition_id") private Competition competition; @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="category_id") private Category category;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="participant_id") private AppUser participant;
 /** Institución o grado de los integrantes (wireframe WF08). */
 private String institutionGrade;
 /** Observación que el organizador deja al participante (wireframe WF18). */
 @Column(length=1500) private String organizerObservation;
 private String fileOriginalName; private String fileStoredName; private String fileContentType; private Long fileSize; private LocalDateTime submittedAt;
 public Long getId(){return id;} public String getTitle(){return title;} public void setTitle(String v){title=v;} public String getSummary(){return summary;} public void setSummary(String v){summary=v;} public String getParticipantNames(){return participantNames;} public void setParticipantNames(String v){participantNames=v;} public Competition getCompetition(){return competition;} public void setCompetition(Competition v){competition=v;} public Category getCategory(){return category;} public void setCategory(Category v){category=v;}
 public AppUser getParticipant(){return participant;} public void setParticipant(AppUser v){participant=v;} public String getFileOriginalName(){return fileOriginalName;} public void setFileOriginalName(String v){fileOriginalName=v;} public String getFileStoredName(){return fileStoredName;} public void setFileStoredName(String v){fileStoredName=v;} public String getFileContentType(){return fileContentType;} public void setFileContentType(String v){fileContentType=v;} public Long getFileSize(){return fileSize;} public void setFileSize(Long v){fileSize=v;} public LocalDateTime getSubmittedAt(){return submittedAt;} public void setSubmittedAt(LocalDateTime v){submittedAt=v;} public String getInstitutionGrade(){return institutionGrade;} public void setInstitutionGrade(String v){institutionGrade=v;}
 public String getOrganizerObservation(){return organizerObservation;} public void setOrganizerObservation(String v){organizerObservation=v;}
 /** Código visible del proyecto, por ejemplo P-001. */
 public String getCode(){return id==null?"P-—":String.format("P-%03d",id);}
 public boolean hasFile(){return fileStoredName!=null&&!fileStoredName.isBlank();}
}
