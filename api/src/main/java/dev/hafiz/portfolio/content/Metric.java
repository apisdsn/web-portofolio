package dev.hafiz.portfolio.content;

import java.util.Map;

/** A headline number on a case study, e.g. value "120 ms" with a bilingual label. */
public record Metric(String value, Map<String, String> label) {
}
