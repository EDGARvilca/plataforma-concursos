package com.concursos.plataforma.model;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="password_reset_tokens")
public class PasswordResetToken {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id") private AppUser user;
 @Column(nullable=false,unique=true) private String token;
 @Column(nullable=false) private LocalDateTime expiresAt;
 private LocalDateTime usedAt;
 public Long getId(){return id;} public AppUser getUser(){return user;} public void setUser(AppUser v){user=v;}
 public String getToken(){return token;} public void setToken(String v){token=v;}
 public LocalDateTime getExpiresAt(){return expiresAt;} public void setExpiresAt(LocalDateTime v){expiresAt=v;}
 public LocalDateTime getUsedAt(){return usedAt;} public void setUsedAt(LocalDateTime v){usedAt=v;}
 public boolean isValid(){return usedAt==null && expiresAt.isAfter(LocalDateTime.now());}
}
