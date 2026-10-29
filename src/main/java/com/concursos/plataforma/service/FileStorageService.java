package com.concursos.plataforma.service;

import com.concursos.plataforma.dto.StoredFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "zip");
    private final Path root;

    public FileStorageService(@Value("${app.storage.location:./data/uploads}") String location) throws IOException {
        root = Path.of(location).toAbsolutePath().normalize();
        Files.createDirectories(root.resolve("bases"));
        Files.createDirectories(root.resolve("submissions"));
    }

    public StoredFile store(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Selecciona un archivo para continuar");
        if (file.getSize() > 25L * 1024 * 1024) throw new IllegalArgumentException("El archivo supera el límite de 25 MB");
        String original = sanitize(file.getOriginalFilename());
        String extension = extension(original);
        if (!ALLOWED_EXTENSIONS.contains(extension)) throw new IllegalArgumentException("Formato no permitido. Usa PDF, Office o ZIP");
        String stored = UUID.randomUUID() + "." + extension;
        Path directory = safeDirectory(folder);
        Path destination = directory.resolve(stored).normalize();
        if (!destination.startsWith(directory)) throw new IllegalArgumentException("Ruta de archivo no válida");
        try (var input = file.getInputStream()) {
            Files.copy(input, destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo guardar el archivo", exception);
        }
        String contentType = file.getContentType() == null ? "application/octet-stream" : file.getContentType();
        return new StoredFile(original, stored, contentType, file.getSize());
    }

    public Resource load(String folder, String storedName) {
        if (storedName == null || storedName.isBlank()) throw new IllegalArgumentException("Archivo no disponible");
        Path directory = safeDirectory(folder);
        Path file = directory.resolve(storedName).normalize();
        if (!file.startsWith(directory)) throw new IllegalArgumentException("Ruta de archivo no válida");
        try {
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) throw new IllegalArgumentException("El archivo ya no está disponible");
            return resource;
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo leer el archivo", exception);
        }
    }

    private Path safeDirectory(String folder) {
        if (!Set.of("bases", "submissions").contains(folder)) throw new IllegalArgumentException("Carpeta no válida");
        return root.resolve(folder).normalize();
    }

    private String sanitize(String filename) {
        String value = filename == null ? "archivo" : Path.of(filename).getFileName().toString();
        value = Normalizer.normalize(value, Normalizer.Form.NFKC).replaceAll("[\\r\\n]", "").trim();
        return value.isBlank() ? "archivo" : value.substring(0, Math.min(value.length(), 180));
    }

    private String extension(String name) {
        int dot = name.lastIndexOf('.');
        return dot < 0 ? "" : name.substring(dot + 1).toLowerCase(Locale.ROOT);
    }
}
