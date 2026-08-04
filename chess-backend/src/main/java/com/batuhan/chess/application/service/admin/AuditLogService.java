package com.batuhan.chess.application.service.admin;

import com.batuhan.chess.api.dto.admin.AuditLogResponse;
import com.batuhan.chess.domain.model.admin.AuditLog;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.AuditLogRepository;
import com.batuhan.chess.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void logAction(Long adminId, String actionType, String details) {
        UserEntity admin = userRepository.findById(adminId)
            .orElseThrow(() -> new IllegalArgumentException("Admin user not found with id: " + adminId));

        AuditLog auditLog = AuditLog.builder()
            .admin(admin)
            .actionType(actionType)
            .details(details)
            .build();

        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(String actionType, Long adminId, Pageable pageable) {
        return auditLogRepository.findWithFilters(actionType, adminId, pageable)
            .map(AuditLogResponse::fromEntity);
    }
}
