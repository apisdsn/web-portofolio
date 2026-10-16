package dev.hafiz.portfolio.content;

import dev.hafiz.portfolio.common.ContentChangeService;
import dev.hafiz.portfolio.common.NotFoundException;
import jakarta.validation.Valid;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/profile")
public class ProfileAdminController {

    private final ProfileRepository repository;
    private final ContentChangeService changes;

    public ProfileAdminController(ProfileRepository repository, ContentChangeService changes) {
        this.repository = repository;
        this.changes = changes;
    }

    @GetMapping
    public Profile get() {
        return load();
    }

    @PutMapping
    @Transactional
    public Profile update(@Valid @RequestBody Profile body) {
        Map<String, Object> before = changes.snapshot(load());
        body.setId(Profile.SINGLETON_ID);
        Profile saved = repository.save(body);
        changes.recorded("profile", Profile.SINGLETON_ID, "UPDATE", before, saved);
        return saved;
    }

    private Profile load() {
        return repository.findById(Profile.SINGLETON_ID)
                .orElseThrow(() -> new NotFoundException("profile", Profile.SINGLETON_ID));
    }
}
