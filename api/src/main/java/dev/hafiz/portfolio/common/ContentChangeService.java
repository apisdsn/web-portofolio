package dev.hafiz.portfolio.common;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.hafiz.portfolio.audit.AuditService;
import dev.hafiz.portfolio.publish.RevalidationClient;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Map;

/**
 * Called after every admin change: writes the audit log entry and, once the
 * transaction commits, asks the Next.js frontend to refresh its cached pages.
 */
@Service
public class ContentChangeService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final AuditService auditService;
    private final RevalidationClient revalidationClient;
    private final ObjectMapper objectMapper;

    public ContentChangeService(AuditService auditService, RevalidationClient revalidationClient,
                                ObjectMapper objectMapper) {
        this.auditService = auditService;
        this.revalidationClient = revalidationClient;
        this.objectMapper = objectMapper;
    }

    /** Captures an entity's state as a plain map, for the audit log's before/after diff. */
    public Map<String, Object> snapshot(Object entity) {
        return entity == null ? null : objectMapper.convertValue(entity, MAP_TYPE);
    }

    public void recorded(String entityType, Object entityId, String action, Object before, Object after) {
        auditService.record(currentActor(), entityType, String.valueOf(entityId), action,
                asSnapshot(before), asSnapshot(after));
        revalidateAfterCommit();
    }

    private Map<String, Object> asSnapshot(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Map<?, ?>) {
            return objectMapper.convertValue(value, MAP_TYPE);
        }
        return snapshot(value);
    }

    private void revalidateAfterCommit() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    revalidationClient.revalidateAsync();
                }
            });
        } else {
            revalidationClient.revalidateAsync();
        }
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication == null ? "system" : authentication.getName();
    }
}
