package dev.hafiz.portfolio.media;

import dev.hafiz.portfolio.common.NotFoundException;
import dev.hafiz.portfolio.config.AppProperties;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

@Service
public class MediaService {

    /** Allowed types and their file extension. The real type is checked from the file's first bytes. */
    private static final Map<String, String> EXTENSIONS = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "application/pdf", ".pdf");

    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final MediaRepository repository;
    private final Path directory;

    public MediaService(MediaRepository repository, AppProperties properties) {
        this.repository = repository;
        this.directory = Path.of(properties.media().dir()).toAbsolutePath().normalize();
    }

    @Transactional
    public Media store(byte[] bytes, String originalFilename) {
        if (bytes.length == 0) {
            throw new IllegalArgumentException("File is empty");
        }
        if (bytes.length > MAX_BYTES) {
            throw new IllegalArgumentException("File is larger than 5 MB");
        }
        String contentType = detectContentType(bytes);
        if (contentType == null) {
            throw new IllegalArgumentException("Only JPEG, PNG, WebP images and PDF files are allowed");
        }

        UUID id = UUID.randomUUID();
        String storageName = id + EXTENSIONS.get(contentType);
        try {
            Files.createDirectories(directory);
            Files.write(directory.resolve(storageName), bytes);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not store file", e);
        }

        Media media = new Media();
        media.setId(id);
        media.setFilename(sanitizeFilename(originalFilename, EXTENSIONS.get(contentType)));
        media.setContentType(contentType);
        media.setSizeBytes(bytes.length);
        media.setStorageName(storageName);
        return repository.save(media);
    }

    @Transactional(readOnly = true)
    public Media get(UUID id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("media", id));
    }

    public Resource load(Media media) {
        Path file = directory.resolve(media.getStorageName()).normalize();
        if (!file.startsWith(directory) || !Files.exists(file)) {
            throw new NotFoundException("media file", media.getId());
        }
        return new FileSystemResource(file);
    }

    static String detectContentType(byte[] b) {
        if (startsWith(b, 0xFF, 0xD8, 0xFF)) {
            return "image/jpeg";
        }
        if (startsWith(b, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) {
            return "image/png";
        }
        if (b.length >= 12 && startsWith(b, 0x52, 0x49, 0x46, 0x46)
                && b[8] == 0x57 && b[9] == 0x45 && b[10] == 0x42 && b[11] == 0x50) {
            return "image/webp";
        }
        if (startsWith(b, 0x25, 0x50, 0x44, 0x46, 0x2D)) {
            return "application/pdf";
        }
        return null;
    }

    private static boolean startsWith(byte[] bytes, int... signature) {
        if (bytes.length < signature.length) {
            return false;
        }
        for (int i = 0; i < signature.length; i++) {
            if ((bytes[i] & 0xFF) != signature[i]) {
                return false;
            }
        }
        return true;
    }

    static String sanitizeFilename(String name, String extension) {
        String base = name == null ? "" : name.substring(Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\')) + 1);
        base = base.replaceAll("[^A-Za-z0-9._-]", "_");
        if (base.isBlank() || base.chars().allMatch(c -> c == '.' || c == '_')) {
            base = "file" + extension;
        }
        return base.length() > 120 ? base.substring(base.length() - 120) : base;
    }
}
