package dev.hafiz.portfolio.publish;

import dev.hafiz.portfolio.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/** Tells the Next.js frontend to drop its cached pages so changes appear immediately. */
@Slf4j
@Component
public class RevalidationClient {

    private final RestClient restClient;
    private final AppProperties.Revalidate config;

    public RevalidationClient(AppProperties properties) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(3));
        factory.setReadTimeout(Duration.ofSeconds(10));
        this.restClient = RestClient.builder().requestFactory(factory).build();
        this.config = properties.revalidate();
    }

    @Async
    public void revalidateAsync() {
        revalidate();
    }

    public boolean revalidate() {
        try {
            restClient.post()
                    .uri(config.url())
                    .header("x-revalidate-secret", config.secret())
                    .retrieve()
                    .toBodilessEntity();
            return true;
        } catch (Exception e) {
            log.warn("Revalidation request to {} failed: {}", config.url(), e.getMessage());
            return false;
        }
    }
}
