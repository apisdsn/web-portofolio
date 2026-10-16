package dev.hafiz.portfolio.common;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.HashSet;
import java.util.List;
import java.util.Map;

/**
 * Shared CRUD + reorder endpoints for orderable content. Each concrete controller
 * only declares its route and repository.
 */
public abstract class AdminCrudController<E extends OrderedEntity> {

    protected final OrderedRepository<E> repository;
    protected final ContentChangeService changes;
    private final String entityType;

    protected AdminCrudController(OrderedRepository<E> repository, ContentChangeService changes, String entityType) {
        this.repository = repository;
        this.changes = changes;
        this.entityType = entityType;
    }

    @GetMapping
    public List<E> list() {
        return repository.findAllByOrderBySortOrderAscIdAsc();
    }

    @GetMapping("/{id}")
    public E get(@PathVariable Long id) {
        return find(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public E create(@Valid @RequestBody E body) {
        body.setId(null);
        body.setSortOrder(repository.findMaxSortOrder() + 1);
        E saved = repository.save(body);
        changes.recorded(entityType, saved.getId(), "CREATE", null, saved);
        return saved;
    }

    @PutMapping("/{id}")
    @Transactional
    public E update(@PathVariable Long id, @Valid @RequestBody E body) {
        E existing = find(id);
        Map<String, Object> before = changes.snapshot(existing);
        body.setId(id);
        E saved = repository.save(body);
        changes.recorded(entityType, id, "UPDATE", before, saved);
        return saved;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable Long id) {
        E existing = find(id);
        Map<String, Object> before = changes.snapshot(existing);
        repository.delete(existing);
        changes.recorded(entityType, id, "DELETE", before, null);
    }

    /** Body: every id of this content type, in the desired order. */
    @PutMapping("/reorder")
    @Transactional
    public List<E> reorder(@RequestBody List<Long> ids) {
        if (ids == null || new HashSet<>(ids).size() != ids.size()) {
            throw new IllegalArgumentException("ids must be a list without duplicates");
        }
        List<E> items = repository.findAllById(ids);
        if (items.size() != ids.size()) {
            throw new IllegalArgumentException("Unknown id in reorder request");
        }
        for (E item : items) {
            item.setSortOrder(ids.indexOf(item.getId()));
        }
        repository.saveAll(items);
        changes.recorded(entityType, "*", "REORDER", null, Map.of("order", ids));
        return list();
    }

    protected E find(Long id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException(entityType, id));
    }
}
