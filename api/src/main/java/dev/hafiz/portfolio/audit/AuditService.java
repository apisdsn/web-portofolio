package dev.hafiz.portfolio.audit;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuditService {

    private final AuditLogRepository repository;

    public AuditService(AuditLogRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public void record(String actor, String entityType, String entityId, String action,
                       Map<String, Object> before, Map<String, Object> after) {
        Map<String, Object> diff = new HashMap<>();
        diff.put("before", before);
        diff.put("after", after);

        AuditLog entry = new AuditLog();
        entry.setActor(actor);
        entry.setEntityType(entityType);
        entry.setEntityId(entityId);
        entry.setAction(action);
        entry.setDiff(diff);
        repository.save(entry);
    }
}
