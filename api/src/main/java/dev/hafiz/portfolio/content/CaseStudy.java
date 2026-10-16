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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "case_study")
@Getter
@Setter
@NoArgsConstructor
public class CaseStudy extends OrderedEntity {

    @NotBlank
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "use lowercase letters, numbers and dashes")
    private String slug;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> title;

    /** Short description used on the home page card. */
    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> summary;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> tags = new ArrayList<>();

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> role;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> period;

    @NotBlank
    private String organization;

    @NotBlank
    private String stack;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> problem;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> approach;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> result;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Metric> metrics = new ArrayList<>();

    /** Markdown, per language. */
    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> body;

    /** Featured case studies get the large card on the home page. */
    private boolean featured;
}
