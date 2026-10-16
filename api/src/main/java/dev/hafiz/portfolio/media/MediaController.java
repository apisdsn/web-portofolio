package dev.hafiz.portfolio.media;

import dev.hafiz.portfolio.common.ContentChangeService;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@RestController
public class MediaController {

    private final MediaService mediaService;
    private final ContentChangeService changes;

    public MediaController(MediaService mediaService, ContentChangeService changes) {
        this.mediaService = mediaService;
        this.changes = changes;
    }

    /** Public: profile photo and CV are linked from the website. Files are immutable per id. */
    @GetMapping("/api/media/{id}")
    public ResponseEntity<Resource> download(@PathVariable UUID id) {
        Media media = mediaService.get(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(media.getContentType()))
                .contentLength(media.getSizeBytes())
                .cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(media.getFilename()).build().toString())
                .header("X-Content-Type-Options", "nosniff")
                .body(mediaService.load(media));
    }

    @PostMapping("/api/admin/media")
    @ResponseStatus(HttpStatus.CREATED)
    public Media upload(@RequestParam("file") MultipartFile file) throws IOException {
        Media media = mediaService.store(file.getBytes(), file.getOriginalFilename());
        changes.recorded("media", media.getId(), "UPLOAD", null, media);
        return media;
    }
}
