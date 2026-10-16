package dev.hafiz.portfolio.content;

import dev.hafiz.portfolio.common.OrderedEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "project")
@Getter
@Setter
@NoArgsConstructor
public class Project extends OrderedEntity {

    @NotBlank
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "use lowercase letters, numbers and dashes")
    private String slug;

    @NotBlank
    private String name;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> tag;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> description;

    @Pattern(regexp = "^$|^https?://.+", message = "must be an http(s) URL")
    private String repoUrl;

    @Pattern(regexp = "^$|^https?://.+", message = "must be an http(s) URL")
    private String demoUrl;
}
