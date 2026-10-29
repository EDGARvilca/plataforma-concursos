package com.concursos.plataforma.model;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="evaluations")
public class Evaluation {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @OneToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="assignment_id",unique=true) private JudgeAssignment assignment; @Column(length=1500) private String comments; private LocalDateTime submittedAt;
 public Long getId(){return id;} public JudgeAssignment getAssignment(){return assignment;} public void setAssignment(JudgeAssignment v){assignment=v;} public String getComments(){return comments;} public void setComments(String v){comments=v;} public LocalDateTime getSubmittedAt(){return submittedAt;} public void setSubmittedAt(LocalDateTime v){submittedAt=v;} public boolean isSubmitted(){return submittedAt!=null;}
}
