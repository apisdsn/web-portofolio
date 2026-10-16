package dev.hafiz.portfolio.auth;

import dev.hafiz.portfolio.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Creates the single admin account from ADMIN_EMAIL / ADMIN_PASSWORD on first start.
 * Existing accounts are never overwritten.
 */
@Slf4j
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final int MIN_PASSWORD_LENGTH = 12;

    private final AdminUserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AppProperties properties;

    public AdminBootstrap(AdminUserRepository users, PasswordEncoder passwordEncoder, AppProperties properties) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) {
        String email = properties.admin().email();
        String password = properties.admin().password();

        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            if (users.count() == 0) {
                log.warn("No admin account exists. Set ADMIN_EMAIL and ADMIN_PASSWORD to create one.");
            }
            return;
        }
        if (users.findByEmailIgnoreCase(email).isPresent()) {
            return;
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            log.error("ADMIN_PASSWORD must be at least {} characters; admin account not created.", MIN_PASSWORD_LENGTH);
            return;
        }
        users.save(new AdminUser(email.trim().toLowerCase(), passwordEncoder.encode(password)));
        log.info("Admin account created for {}", email);
    }
}
