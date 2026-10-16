package dev.hafiz.portfolio.content;

import dev.hafiz.portfolio.common.NotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/** Read-only, published content for the public website. */
@RestController
@RequestMapping("/api/public")
@Transactional(readOnly = true)
public class PublicController {

    /** Case study without its long Markdown body, for list views. */
    public record CaseStudySummary(Long id, String slug, Map<String, String> title, Map<String, String> summary,
                                   List<String> tags, String stack, List<Metric> metrics, boolean featured) {

        static CaseStudySummary of(CaseStudy c) {
            return new CaseStudySummary(c.getId(), c.getSlug(), c.getTitle(), c.getSummary(), c.getTags(),
                    c.getStack(), c.getMetrics(), c.isFeatured());
        }
    }

    public record SiteResponse(Profile profile,
                               List<Experience> experiences,
                               List<Project> projects,
                               List<CaseStudySummary> caseStudies,
                               List<SkillGroup> skillGroups,
                               List<Education> education,
                               List<Certification> certifications) {
    }

    private final ProfileRepository profiles;
    private final ExperienceRepository experiences;
    private final ProjectRepository projects;
    private final CaseStudyRepository caseStudies;
    private final SkillGroupRepository skillGroups;
    private final EducationRepository education;
    private final CertificationRepository certifications;

    public PublicController(ProfileRepository profiles, ExperienceRepository experiences,
                            ProjectRepository projects, CaseStudyRepository caseStudies,
                            SkillGroupRepository skillGroups, EducationRepository education,
                            CertificationRepository certifications) {
        this.profiles = profiles;
        this.experiences = experiences;
        this.projects = projects;
        this.caseStudies = caseStudies;
        this.skillGroups = skillGroups;
        this.education = education;
        this.certifications = certifications;
    }

    @GetMapping("/site")
    public SiteResponse site() {
        Profile profile = profiles.findById(Profile.SINGLETON_ID)
                .orElseThrow(() -> new NotFoundException("profile", Profile.SINGLETON_ID));
        return new SiteResponse(
                profile,
                experiences.findByPublishedTrueOrderBySortOrderAscIdAsc(),
                projects.findByPublishedTrueOrderBySortOrderAscIdAsc(),
                caseStudies.findByPublishedTrueOrderBySortOrderAscIdAsc().stream()
                        .map(CaseStudySummary::of)
                        .toList(),
                skillGroups.findByPublishedTrueOrderBySortOrderAscIdAsc(),
                education.findByPublishedTrueOrderBySortOrderAscIdAsc(),
                certifications.findByPublishedTrueOrderBySortOrderAscIdAsc());
    }

    @GetMapping("/case-studies/{slug}")
    public CaseStudy caseStudy(@PathVariable String slug) {
        return caseStudies.findBySlugAndPublishedTrue(slug)
                .orElseThrow(() -> new NotFoundException("case study", slug));
    }
}
