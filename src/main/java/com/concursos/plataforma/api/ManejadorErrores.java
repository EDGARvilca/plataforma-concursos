package com.concursos.plataforma.api;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/**
 * Convierte las excepciones en respuestas JSON con un campo "mensaje",
 * que es lo que el frontend muestra en pantalla.
 */
@RestControllerAdvice(basePackages = "com.concursos.plataforma.api")
public class ManejadorErrores {

    private static final Logger registro = LoggerFactory.getLogger(ManejadorErrores.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> reglaDeNegocio(IllegalArgumentException error) {
        return respuesta(HttpStatus.BAD_REQUEST, error.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> datosInvalidos(MethodArgumentNotValidException error) {
        String mensaje = error.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(campo -> campo.getDefaultMessage())
                .orElse("Hay datos que no son válidos");
        return respuesta(HttpStatus.BAD_REQUEST, mensaje);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<Map<String, String>> cuentaDesactivada(DisabledException error) {
        return respuesta(HttpStatus.UNAUTHORIZED, "Tu cuenta está desactivada, comunícate con el administrador");
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> credencialesIncorrectas(AuthenticationException error) {
        return respuesta(HttpStatus.UNAUTHORIZED, "El correo o la contraseña no son correctos");
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, String>> archivoMuyGrande(MaxUploadSizeExceededException error) {
        return respuesta(HttpStatus.PAYLOAD_TOO_LARGE, "El archivo supera el tamaño máximo permitido (25 MB)");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> errorInesperado(Exception error) {
        registro.error("Error inesperado en la API", error);
        return respuesta(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un problema inesperado, intenta de nuevo");
    }

    private ResponseEntity<Map<String, String>> respuesta(HttpStatus estado, String mensaje) {
        return ResponseEntity.status(estado).body(Map.of("mensaje", mensaje == null ? "Error" : mensaje));
    }
}
