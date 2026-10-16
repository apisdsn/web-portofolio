package dev.hafiz.portfolio.content;

import dev.hafiz.portfolio.common.AdminCrudController;
import dev.hafiz.portfolio.common.ContentChangeService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/case-studies")
public class CaseStudyAdminController extends AdminCrudController<CaseStudy> {

    public CaseStudyAdminController(CaseStudyRepository repository, ContentChangeService changes) {
        super(repository, changes, "case_study");
    }
}
