package com.concursos.plataforma.model;
import jakarta.persistence.*;
@Entity @Table(name="judge_assignments",uniqueConstraints=@UniqueConstraint(columnNames={"judge_id","submission_id"}))
public class JudgeAssignment {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="judge_id") private AppUser judge; @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="submission_id") private Submission submission;
 public Long getId(){return id;} public AppUser getJudge(){return judge;} public void setJudge(AppUser v){judge=v;} public Submission getSubmission(){return submission;} public void setSubmission(Submission v){submission=v;}
}
