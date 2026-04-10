package org.example.QuanLyMuaVu.module.admin.repository;

import java.util.List;
import org.example.QuanLyMuaVu.module.admin.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Find all audit logs for a specific entity, ordered by most recent first.
     * Useful for viewing audit trail of a specific farm, plot, season, etc.
     */
    List<AuditLog> findByEntityTypeAndEntityIdOrderByPerformedAtDesc(
            String entityType,
            Integer entityId);

    /**
     * Find audit logs by operation type (e.g., all SOFT_DELETE operations).
     */
    List<AuditLog> findByOperationOrderByPerformedAtDesc(String operation);
}
