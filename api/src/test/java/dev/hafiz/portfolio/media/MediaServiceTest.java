package dev.hafiz.portfolio.media;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class MediaServiceTest {

    @Test
    void detectsAllowedTypesFromMagicBytes() {
        assertThat(MediaService.detectContentType(bytes(0xFF, 0xD8, 0xFF, 0xE0))).isEqualTo("image/jpeg");
        assertThat(MediaService.detectContentType(bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)))
                .isEqualTo("image/png");
        assertThat(MediaService.detectContentType("RIFF\0\0\0\0WEBPVP8 ".getBytes(StandardCharsets.ISO_8859_1)))
                .isEqualTo("image/webp");
        assertThat(MediaService.detectContentType("%PDF-1.7".getBytes(StandardCharsets.US_ASCII)))
                .isEqualTo("application/pdf");
    }

    @Test
    void rejectsOtherContentEvenWithAnImageName() {
        assertThat(MediaService.detectContentType("<svg onload=alert(1)>".getBytes(StandardCharsets.UTF_8))).isNull();
        assertThat(MediaService.detectContentType(new byte[0])).isNull();
    }

    @Test
    void sanitizesFilenames() {
        assertThat(MediaService.sanitizeFilename("../../etc/passwd", ".pdf")).isEqualTo("passwd");
        assertThat(MediaService.sanitizeFilename("CV Hafiz (final).pdf", ".pdf")).isEqualTo("CV_Hafiz__final_.pdf");
        assertThat(MediaService.sanitizeFilename(null, ".png")).isEqualTo("file.png");
    }

    private static byte[] bytes(int... values) {
        byte[] result = new byte[values.length];
        for (int i = 0; i < values.length; i++) {
            result[i] = (byte) values[i];
        }
        return result;
    }
}
