package com.concursos.plataforma.dto;

public record StoredFile(String originalName, String storedName, String contentType, long size) {}
