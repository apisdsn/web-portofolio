package dev.hafiz.portfolio.content;

import dev.hafiz.portfolio.common.AdminCrudController;
import dev.hafiz.portfolio.common.ContentChangeService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/projects")
public class ProjectAdminController extends AdminCrudController<Project> {

    public ProjectAdminController(ProjectRepository repository, ContentChangeService changes) {
        super(repository, changes, "project");
    }
}
