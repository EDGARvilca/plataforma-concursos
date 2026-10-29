package com.concursos.plataforma.model;
import jakarta.persistence.*; import jakarta.validation.constraints.AssertTrue; import jakarta.validation.constraints.Min; import jakarta.validation.constraints.NotBlank; import jakarta.validation.constraints.Size; import org.springframework.format.annotation.DateTimeFormat; import java.time.LocalDate; import java.time.LocalDateTime;
@Entity @Table(name="competitions")
public class Competition {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @NotBlank(message="El nombre es obligatorio") @Size(max=160,message="El nombre no puede superar 160 caracteres") @Column(nullable=false,length=160) private String name;
  @Size(max=1500,message="La descripción no puede superar 1500 caracteres") @Column(length=1500) private String description;
  @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) private LocalDate startDate;
  @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) private LocalDate endDate;
  @Enumerated(EnumType.STRING) @Column(nullable=false) private CompetitionStatus status=CompetitionStatus.DRAFT;
  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="organizer_id") private AppUser organizer;
  private String basesOriginalName;
  private String basesStoredName;
  private String basesContentType;
  private Long basesSize;
  private LocalDateTime basesUploadedAt;
  /** Reglas básicas del concurso (wireframe WF04). Todos son opcionales. */
  @Size(max=80,message="El tipo no puede superar 80 caracteres") @Column(length=80) private String type;
  @Min(value=1,message="El cupo máximo debe ser al menos 1") private Integer maxProjects;
  @Min(value=1,message="Se requiere al menos 1 jurado por proyecto") private Integer minJudges;
  @Size(max=1500,message="Las condiciones no pueden superar 1500 caracteres") @Column(length=1500) private String conditions;
  public String getType(){return type;} public void setType(String v){type=v;}
  public Integer getMaxProjects(){return maxProjects;} public void setMaxProjects(Integer v){maxProjects=v;}
  public Integer getMinJudges(){return minJudges;} public void setMinJudges(Integer v){minJudges=v;}
  public String getConditions(){return conditions;} public void setConditions(String v){conditions=v;}
  /** Mínimo de jurados por proyecto; si no se configuró, se usa 2. */
  public int requiredJudges(){return minJudges==null?2:minJudges;}
  @AssertTrue(message="La fecha de cierre debe ser igual o posterior a la fecha de inicio") public boolean isDateRangeValid(){return startDate==null||endDate==null||!endDate.isBefore(startDate);}
  public Long getId(){return id;} public String getName(){return name;} public void setName(String v){name=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;}
  public LocalDate getStartDate(){return startDate;} public void setStartDate(LocalDate v){startDate=v;} public LocalDate getEndDate(){return endDate;} public void setEndDate(LocalDate v){endDate=v;}
  public CompetitionStatus getStatus(){return status;} public void setStatus(CompetitionStatus v){status=v;} public AppUser getOrganizer(){return organizer;} public void setOrganizer(AppUser v){organizer=v;}
  public String getBasesOriginalName(){return basesOriginalName;} public void setBasesOriginalName(String v){basesOriginalName=v;}
  public String getBasesStoredName(){return basesStoredName;} public void setBasesStoredName(String v){basesStoredName=v;}
  public String getBasesContentType(){return basesContentType;} public void setBasesContentType(String v){basesContentType=v;}
  public Long getBasesSize(){return basesSize;} public void setBasesSize(Long v){basesSize=v;}
  public LocalDateTime getBasesUploadedAt(){return basesUploadedAt;} public void setBasesUploadedAt(LocalDateTime v){basesUploadedAt=v;}
  public boolean hasBases(){return basesStoredName!=null&&!basesStoredName.isBlank();}
}
