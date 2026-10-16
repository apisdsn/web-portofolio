package dev.hafiz.portfolio.media;

import dev.hafiz.portfolio.content.Profile;
import dev.hafiz.portfolio.content.ProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;

/**
 * On a fresh install, stores the bundled profile photo so the site has an
 * avatar from the first start. Skipped as soon as any media exists.
 */
@Slf4j
@Component
public class SeedMediaRunner implements ApplicationRunner {

    private static final String SEED_PHOTO = "seed/avatar.webp";

    private final MediaRepository mediaRepository;
    private final MediaService mediaService;
    private final ProfileRepository profileRepository;

    public SeedMediaRunner(MediaRepository mediaRepository, MediaService mediaService,
                           ProfileRepository profileRepository) {
        this.mediaRepository = mediaRepository;
        this.mediaService = mediaService;
        this.profileRepository = profileRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws IOException {
        if (mediaRepository.count() > 0) {
            return;
        }
        Profile profile = profileRepository.findById(Profile.SINGLETON_ID).orElse(null);
        ClassPathResource photo = new ClassPathResource(SEED_PHOTO);
        if (profile == null || profile.getPhotoMediaId() != null || !photo.exists()) {
            return;
        }
        try (InputStream in = photo.getInputStream()) {
            Media media = mediaService.store(in.readAllBytes(), "avatar.webp");
            profile.setPhotoMediaId(media.getId());
            profileRepository.save(profile);
            log.info("Seeded profile photo as media {}", media.getId());
        }
    }
}
