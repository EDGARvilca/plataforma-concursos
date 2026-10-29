package com.concursos.plataforma.model;
import jakarta.persistence.*;
@Entity @Table(name="app_users")
public class AppUser {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(nullable=false) private String fullName;
  @Column(nullable=false, unique=true) private String email;
  @Column(nullable=false) private String password;
  @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role;
  /** Nullable: las cuentas anteriores a este campo se consideran activas. */
  private Boolean active;
  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="institution_id") private Institution institution;
  public AppUser(){}
  public AppUser(String fullName,String email,String password,Role role){this.fullName=fullName;this.email=email;this.password=password;this.role=role;}
  public Long getId(){return id;} public String getFullName(){return fullName;} public void setFullName(String v){fullName=v;}
  public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getPassword(){return password;} public void setPassword(String v){password=v;}
  public Role getRole(){return role;} public void setRole(Role v){role=v;}
  public boolean isActive(){return active==null||active;} public void setActive(boolean v){active=v;}
  public Institution getInstitution(){return institution;} public void setInstitution(Institution v){institution=v;}
}
