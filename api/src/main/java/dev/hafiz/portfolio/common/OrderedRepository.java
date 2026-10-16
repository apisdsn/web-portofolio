package dev.hafiz.portfolio.common;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;

@NoRepositoryBean
public interface OrderedRepository<E extends OrderedEntity> extends JpaRepository<E, Long> {

    List<E> findAllByOrderBySortOrderAscIdAsc();

    List<E> findByPublishedTrueOrderBySortOrderAscIdAsc();

    @Query("select coalesce(max(e.sortOrder), -1) from #{#entityName} e")
    int findMaxSortOrder();
}
