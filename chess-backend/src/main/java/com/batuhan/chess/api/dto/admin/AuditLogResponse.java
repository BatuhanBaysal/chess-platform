package com.batuhan.chess.api.dto.admin;

import com.batuhan.chess.domain.model.admin.AuditLog;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record AuditLogResponse(
    Long id,
    Long adminId,
    String adminUsername,
    String actionType,
    String details,
    LocalDateTime createdAt
) {
    public static AuditLogResponse fromEntity(AuditLog auditLog) {
        return AuditLogResponse.builder()
            .id(auditLog.getId())
            .adminId(auditLog.getAdmin() != null ? auditLog.getAdmin().getId() : null)
            .adminUsername(auditLog.getAdmin() != null ? auditLog.getAdmin().getUsername() : "Unknown")
            .actionType(auditLog.getActionType())
            .details(auditLog.getDetails())
            .createdAt(auditLog.getCreatedAt())
            .build();
    }
}
