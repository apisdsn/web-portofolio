package dev.hafiz.portfolio.auth;

import dev.hafiz.portfolio.config.AppProperties;
import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private static AppProperties props(String secret, Duration ttl) {
        return new AppProperties(
                new AppProperties.Jwt(secret, ttl),
                new AppProperties.Cookie("portfolio_token", false),
                new AppProperties.Admin("", ""),
                new AppProperties.Login(5, Duration.ofMinutes(15)),
                new AppProperties.Media("./data/media"),
                new AppProperties.Revalidate("http://localhost:3000/internal/revalidate", "secret"));
    }

    @Test
    void issuedTokenVerifiesToItsSubject() {
        JwtService service = new JwtService(props("a-very-long-test-secret-that-is-over-32-bytes", Duration.ofHours(1)));

        String token = service.issue("admin@example.com");

        assertThat(service.verify(token)).contains("admin@example.com");
    }

    @Test
    void tamperedTokenIsRejected() {
        JwtService service = new JwtService(props("a-very-long-test-secret-that-is-over-32-bytes", Duration.ofHours(1)));
        String token = service.issue("admin@example.com");

        String tampered = token.substring(0, token.length() - 2) + (token.endsWith("A") ? "BB" : "AA");

        assertThat(service.verify(tampered)).isEmpty();
    }

    @Test
    void tokenSignedWithAnotherSecretIsRejected() {
        JwtService issuer = new JwtService(props("first-secret-first-secret-first-secret-123", Duration.ofHours(1)));
        JwtService verifier = new JwtService(props("other-secret-other-secret-other-secret-456", Duration.ofHours(1)));

        assertThat(verifier.verify(issuer.issue("admin@example.com"))).isEmpty();
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService service = new JwtService(props("a-very-long-test-secret-that-is-over-32-bytes", Duration.ofSeconds(-10)));

        assertThat(service.verify(service.issue("admin@example.com"))).isEmpty();
    }

    @Test
    void shortSecretFailsFast() {
        assertThatThrownBy(() -> new JwtService(props("too-short", Duration.ofHours(1))))
                .isInstanceOf(IllegalStateException.class);
    }
}
