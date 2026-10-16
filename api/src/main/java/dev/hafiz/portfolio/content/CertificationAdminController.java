package dev.hafiz.portfolio.content;

import dev.hafiz.portfolio.common.AdminCrudController;
import dev.hafiz.portfolio.common.ContentChangeService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/certifications")
public class CertificationAdminController extends AdminCrudController<Certification> {

    public CertificationAdminController(CertificationRepository repository, ContentChangeService changes) {
        super(repository, changes, "certification");
    }
}
