package com.batuhan.chess.api.controller;

import com.batuhan.chess.api.dto.admin.AuditLogResponse;
import com.batuhan.chess.application.service.admin.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Audit Log Management", description = "Endpoints for tracking and querying administrative audit logs.")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @Operation(
        summary = "Get audit logs",
        description = "Retrieves a filtered and paginated list of administrative audit logs."
    )
    @ApiResponse(responseCode = "200", description = "Audit logs retrieved successfully")
    @GetMapping
    public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
        @RequestParam(required = false) String actionType,
        @RequestParam(required = false) Long adminId,
        @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        log.info("ADMIN_ACTION: Fetching audit logs - actionType: {}, adminId: {}, page: {}, size: {}",
            actionType, adminId, pageable.getPageNumber(), pageable.getPageSize());
        Page<AuditLogResponse> logs = auditLogService.getAuditLogs(actionType, adminId, pageable);
        log.info("ADMIN_ACTION: Successfully retrieved {} audit logs", logs.getTotalElements());
        return ResponseEntity.ok(logs);
    }
}
