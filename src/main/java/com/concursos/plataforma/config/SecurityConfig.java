package com.concursos.plataforma.config;

import com.concursos.plataforma.repository.AppUserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import java.io.IOException;
import java.util.function.Supplier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Seguridad de la aplicación. El frontend (React) vive en el mismo servidor, así que uso
 * sesión con cookie: el login es una llamada JSON a /api/autenticacion/iniciar y cada
 * ruta de la API se protege por rol. Las páginas del frontend son públicas porque
 * los datos solo se pueden pedir a la API ya autenticado.
 */
@Configuration
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService(AppUserRepository usuarios) {
        return username -> usuarios.findByEmail(username)
                .map(usuario -> User.withUsername(usuario.getEmail())
                        .password(usuario.getPassword())
                        .roles(usuario.getRole().name())
                        .disabled(!usuario.isActive())
                        .build())
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuracion) throws Exception {
        return configuracion.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain cadenaDeSeguridad(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(reglas -> reglas
                        .requestMatchers("/api/autenticacion/iniciar", "/api/autenticacion/olvide",
                                "/api/autenticacion/restablecer", "/api/autenticacion/restablecer/validar").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/api/jurado/**").hasRole("JUDGE")
                        .requestMatchers("/api/participante/**").hasRole("PARTICIPANT")
                        .requestMatchers("/api/administracion/**").hasRole("ADMIN")
                        .requestMatchers("/api/panel/**", "/api/concursos/**", "/api/proyectos/**", "/api/resultados/**")
                        .hasAnyRole("ADMIN", "ORGANIZER")
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .exceptionHandling(errores -> errores
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                        .accessDeniedHandler((peticion, respuesta, error) -> respuesta.setStatus(HttpStatus.FORBIDDEN.value())))
                .formLogin(formulario -> formulario.disable())
                .logout(salida -> salida.disable())
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new ManejadorTokenCsrf())
                        .ignoringRequestMatchers("/h2-console/**"))
                .addFilterAfter(new FiltroCookieCsrf(), org.springframework.security.web.csrf.CsrfFilter.class)
                .headers(cabeceras -> cabeceras.frameOptions(marco -> marco.sameOrigin()));
        return http.build();
    }

    /** Lee el token CSRF que React manda en la cabecera X-XSRF-TOKEN. */
    static final class ManejadorTokenCsrf implements CsrfTokenRequestHandler {

        private final CsrfTokenRequestAttributeHandler delegado = new CsrfTokenRequestAttributeHandler();

        @Override
        public void handle(jakarta.servlet.http.HttpServletRequest peticion,
                           jakarta.servlet.http.HttpServletResponse respuesta, Supplier<CsrfToken> token) {
            delegado.handle(peticion, respuesta, token);
        }

        @Override
        public String resolveCsrfTokenValue(jakarta.servlet.http.HttpServletRequest peticion, CsrfToken token) {
            return delegado.resolveCsrfTokenValue(peticion, token);
        }
    }

    /** Fuerza que la cookie XSRF-TOKEN se envíe desde la primera carga de la página. */
    static final class FiltroCookieCsrf extends OncePerRequestFilter {

        @Override
        protected void doFilterInternal(jakarta.servlet.http.HttpServletRequest peticion,
                                        jakarta.servlet.http.HttpServletResponse respuesta, FilterChain cadena)
                throws ServletException, IOException {
            CsrfToken token = (CsrfToken) peticion.getAttribute(CsrfToken.class.getName());
            if (token != null) {
                token.getToken();
            }
            cadena.doFilter(peticion, respuesta);
        }
    }
}
