package dev.hafiz.portfolio.content;

import dev.hafiz.portfolio.common.AdminCrudController;
import dev.hafiz.portfolio.common.ContentChangeService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/skill-groups")
public class SkillGroupAdminController extends AdminCrudController<SkillGroup> {

    public SkillGroupAdminController(SkillGroupRepository repository, ContentChangeService changes) {
        super(repository, changes, "skill_group");
    }
}
