package dev.hafiz.portfolio.content;

import dev.hafiz.portfolio.common.OrderedEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;

@Entity
@Table(name = "skill_group")
@Getter
@Setter
@NoArgsConstructor
public class SkillGroup extends OrderedEntity {

    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> label;

    /** Items as display text, e.g. "Java · TypeScript · Python (basic)". */
    @NotNull
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, String> items;
}
