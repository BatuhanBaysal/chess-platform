package com.batuhan.chess.domain.repository;

import com.batuhan.chess.domain.model.admin.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE (:actionType IS NULL OR a.actionType = :actionType) " +
        "AND (:adminId IS NULL OR a.admin.id = :adminId)")
    Page<AuditLog> findWithFilters(@Param("actionType") String actionType,
                                   @Param("adminId") Long adminId,
                                   Pageable pageable);
}
