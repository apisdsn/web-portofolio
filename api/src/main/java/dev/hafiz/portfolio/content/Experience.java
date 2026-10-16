package dev.hafiz.portfolio.content;

import dev.hafiz.portfolio.common.OrderedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "experience")
@Getter
@Setter
@NoArgsConstructor
public class Experience extends OrderedEntity {

    /** Stored as the first day of the month; the frontend shows month and year only. */
    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;

    /** True for an ongoing role ("Jul 2026 – present"). */
    @Column(name = "is_current", nullable = false)
    private boolean current;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> role;

    @NotBlank
    private String organization;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> description;

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private List<String> stack = new ArrayList<>();
}
