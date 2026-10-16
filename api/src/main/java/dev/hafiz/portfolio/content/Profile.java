package dev.hafiz.portfolio.content;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/** Site-wide profile and settings. Always a single row with id = 1. */
@Entity
@Table(name = "profile")
@Getter
@Setter
@NoArgsConstructor
public class Profile {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    @NotBlank
    private String fullName;

    /** Text logo in the site header and admin, e.g. "~/apisdsn". */
    @NotBlank
    @Size(max = 40)
    private String logoText;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> headline;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> subHeadline;

    /** Short text shown in the bubble above the profile photo. */
    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> statusText;

    @NotBlank
    private String location;

    @NotBlank
    @Email
    private String email;

    @Pattern(regexp = "^$|^https?://.+", message = "must be an http(s) URL")
    private String linkedinUrl;

    @Pattern(regexp = "^$|^https?://.+", message = "must be an http(s) URL")
    private String githubUrl;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> contactText;

    private UUID photoMediaId;

    private UUID cvMediaId;

    @NotBlank
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "must be a hex color like #1B6E47")
    private String accentColor;

    @NotBlank
    @Pattern(regexp = "^(id|en)$", message = "must be 'id' or 'en'")
    private String defaultLang;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> seoTitle;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> seoDescription;

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    @PrePersist
    @PreUpdate
    void touch() {
        updatedAt = Instant.now();
    }
}
