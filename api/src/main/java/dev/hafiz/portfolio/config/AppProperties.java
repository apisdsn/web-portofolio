package dev.hafiz.portfolio.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        Jwt jwt,
        Cookie cookie,
        Admin admin,
        Login login,
        Media media,
        Revalidate revalidate
) {

    public record Jwt(String secret, Duration ttl) {
    }

    public record Cookie(String name, boolean secure) {
    }

    public record Admin(String email, String password) {
    }

    public record Login(int maxAttempts, Duration window) {
    }

    public record Media(String dir) {
    }

    public record Revalidate(String url, String secret) {
    }
}
