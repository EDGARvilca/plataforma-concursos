package com.concursos.plataforma.api;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/** Arma la respuesta de descarga de un archivo (bases, trabajos, reportes). */
final class Descargas {

    private Descargas() {
    }

    static ResponseEntity<Resource> archivo(Resource recurso, String nombre, String tipoContenido) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(nombre).build().toString())
                .contentType(tipoSeguro(tipoContenido))
                .body(recurso);
    }

    static MediaType tipoSeguro(String tipoContenido) {
        try {
            return MediaType.parseMediaType(tipoContenido == null ? "application/octet-stream" : tipoContenido);
        } catch (Exception ignorado) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
