package com.concursos.plataforma.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * React maneja sus propias rutas (/concursos, /jurado, etc.). Cuando alguien recarga la página
 * o entra directo por un enlace, el servidor tiene que devolver siempre el index.html del frontend.
 */
@Controller
public class RutasDelFrontend {

    @GetMapping({"/", "/{ruta:^(?!api$|assets$|h2-console$)[^.]*}", "/{ruta:^(?!api$|assets$|h2-console$)[^.]*}/**"})
    public String entregarFrontend() {
        return "forward:/index.html";
    }
}
