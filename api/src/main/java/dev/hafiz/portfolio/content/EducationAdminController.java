package dev.hafiz.portfolio.content;

import dev.hafiz.portfolio.common.AdminCrudController;
import dev.hafiz.portfolio.common.ContentChangeService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/education")
public class EducationAdminController extends AdminCrudController<Education> {

    public EducationAdminController(EducationRepository repository, ContentChangeService changes) {
        super(repository, changes, "education");
    }
}
