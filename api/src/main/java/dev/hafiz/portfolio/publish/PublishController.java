package dev.hafiz.portfolio.publish;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class PublishController {

    private final RevalidationClient revalidationClient;

    public PublishController(RevalidationClient revalidationClient) {
        this.revalidationClient = revalidationClient;
    }

    /** Manual "refresh the public site now" button in the dashboard. */
    @PostMapping("/api/admin/publish")
    public Map<String, Boolean> publish() {
        return Map.of("revalidated", revalidationClient.revalidate());
    }
}
