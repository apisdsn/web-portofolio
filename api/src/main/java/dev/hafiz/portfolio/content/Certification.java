package dev.hafiz.portfolio.content;

import dev.hafiz.portfolio.common.OrderedEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "certification")
@Getter
@Setter
@NoArgsConstructor
public class Certification extends OrderedEntity {

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> name;

    @NotBlank
    private String issuer;

    @NotNull
    @Min(1950)
    @Max(2100)
    private Integer year;
}
