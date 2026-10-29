package com.concursos.plataforma.dto;

import java.time.LocalDateTime;

/** Un evento reciente del sistema, mostrado en el dashboard del administrador. */
public record ActivityItem(String text, LocalDateTime at) {
}
