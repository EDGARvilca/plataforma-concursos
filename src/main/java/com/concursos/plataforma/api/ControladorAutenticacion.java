package com.concursos.plataforma.api;

import com.concursos.plataforma.api.Vistas.UsuarioVista;
import com.concursos.plataforma.model.AppUser;
import com.concursos.plataforma.repository.AppUserRepository;
import com.concursos.plataforma.service.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Inicio y cierre de sesión, y recuperación de contraseña. */
@RestController
@RequestMapping("/api/autenticacion")
public class ControladorAutenticacion {

    public record SolicitudInicio(@NotBlank(message = "Escribe tu correo") String correo,
                                  @NotBlank(message = "Escribe tu contraseña") String clave) {
    }

    public record SolicitudOlvido(@NotBlank(message = "Escribe tu correo") String correo) {
    }

    public record SolicitudRestablecer(@NotBlank String token, String clave, String confirmacion) {
    }

    private final AuthenticationManager gestorAutenticacion;
    private final AppUserRepository usuarios;
    private final PasswordResetService recuperacion;
    private final SecurityContextRepository repositorioContexto = new HttpSessionSecurityContextRepository();
    private final SecurityContextHolderStrategy estrategiaContexto = SecurityContextHolder.getContextHolderStrategy();

    public ControladorAutenticacion(AuthenticationManager gestorAutenticacion, AppUserRepository usuarios,
                                    PasswordResetService recuperacion) {
        this.gestorAutenticacion = gestorAutenticacion;
        this.usuarios = usuarios;
        this.recuperacion = recuperacion;
    }

    @PostMapping("/iniciar")
    public UsuarioVista iniciarSesion(@RequestBody @jakarta.validation.Valid SolicitudInicio solicitud,
                                      HttpServletRequest peticion, HttpServletResponse respuesta) {
        String correo = solicitud.correo().trim().toLowerCase();
        Authentication autenticacion = gestorAutenticacion.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(correo, solicitud.clave()));

        // Cambio el id de la sesión para evitar que alguien la fije de antemano
        if (peticion.getSession(false) != null) {
            peticion.changeSessionId();
        }

        // Guardo la sesión para que el navegador siga autenticado en las siguientes llamadas
        SecurityContext contexto = estrategiaContexto.createEmptyContext();
        contexto.setAuthentication(autenticacion);
        estrategiaContexto.setContext(contexto);
        repositorioContexto.saveContext(contexto, peticion, respuesta);

        return Vistas.usuario(usuarios.findByEmail(correo).orElseThrow());
    }

    @PostMapping("/salir")
    public Map<String, String> cerrarSesion(HttpServletRequest peticion, HttpServletResponse respuesta,
                                            Authentication autenticacion) {
        new SecurityContextLogoutHandler().logout(peticion, respuesta, autenticacion);
        return Map.of("mensaje", "Sesión cerrada");
    }

    /** Devuelve el usuario de la sesión actual; el frontend lo usa al cargar la página. */
    @GetMapping("/yo")
    public UsuarioVista usuarioActual(Authentication autenticacion) {
        AppUser usuario = usuarios.findByEmail(autenticacion.getName())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return Vistas.usuario(usuario);
    }

    /** Siempre responde igual para no revelar si el correo existe. El enlace se devuelve porque aún no se envía correo real. */
    @PostMapping("/olvide")
    public Map<String, Object> olvideContrasena(@RequestBody @jakarta.validation.Valid SolicitudOlvido solicitud) {
        var token = recuperacion.requestReset(solicitud.correo());
        return token.<Map<String, Object>>map(valor -> Map.of(
                        "mensaje", "Si el correo existe, se generó un enlace de recuperación",
                        "enlace", "/restablecer-clave?token=" + valor))
                .orElse(Map.of("mensaje", "Si el correo existe, se generó un enlace de recuperación"));
    }

    @GetMapping("/restablecer/validar")
    public Map<String, Boolean> validarToken(@org.springframework.web.bind.annotation.RequestParam String token) {
        recuperacion.validateToken(token);
        return Map.of("valido", true);
    }

    @PostMapping("/restablecer")
    public Map<String, String> restablecer(@RequestBody @jakarta.validation.Valid SolicitudRestablecer solicitud) {
        recuperacion.resetPassword(solicitud.token(), solicitud.clave(), solicitud.confirmacion());
        return Map.of("mensaje", "Contraseña actualizada, ya puedes iniciar sesión");
    }
}
