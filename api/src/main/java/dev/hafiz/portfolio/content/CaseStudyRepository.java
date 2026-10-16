package dev.hafiz.portfolio.content;

import dev.hafiz.portfolio.common.OrderedRepository;

import java.util.Optional;

public interface CaseStudyRepository extends OrderedRepository<CaseStudy> {

    Optional<CaseStudy> findBySlugAndPublishedTrue(String slug);
}
