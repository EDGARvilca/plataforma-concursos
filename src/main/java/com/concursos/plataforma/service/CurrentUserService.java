package com.concursos.plataforma.service;
import com.concursos.plataforma.model.AppUser; import com.concursos.plataforma.repository.AppUserRepository; import org.springframework.security.core.Authentication; import org.springframework.stereotype.Service;
@Service public class CurrentUserService {private final AppUserRepository users; public CurrentUserService(AppUserRepository users){this.users=users;} public AppUser require(Authentication a){return users.findByEmail(a.getName()).orElseThrow(()->new IllegalStateException("Usuario autenticado no encontrado"));}}
