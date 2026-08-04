package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.admin.AuditLogResponse;
import com.batuhan.chess.application.service.admin.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
        @RequestParam(required = false) String actionType,
        @RequestParam(required = false) Long adminId,
        @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        Page<AuditLogResponse> logs = auditLogService.getAuditLogs(actionType, adminId, pageable);
        return ResponseEntity.ok(logs);
    }
}
