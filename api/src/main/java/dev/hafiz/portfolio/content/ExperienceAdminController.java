package dev.hafiz.portfolio.content;

import dev.hafiz.portfolio.common.AdminCrudController;
import dev.hafiz.portfolio.common.ContentChangeService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/experiences")
public class ExperienceAdminController extends AdminCrudController<Experience> {

    public ExperienceAdminController(ExperienceRepository repository, ContentChangeService changes) {
        super(repository, changes, "experience");
    }
}
