package com.batuhan.chess.api.config.audit;

import com.batuhan.chess.application.service.admin.AuditLogService;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class AuditLogAspect {

    private final AuditLogService auditLogService;
    private final UserRepository userRepository;

    @AfterReturning("@annotation(auditableAction)")
    public void logAdminAction(JoinPoint joinPoint, AuditableAction auditableAction) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                Object principal = authentication.getPrincipal();
                Long adminId = null;

                if (principal instanceof UserEntity userEntity) {
                    adminId = userEntity.getId();
                } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
                    adminId = userRepository.findByUsername(userDetails.getUsername())
                        .map(UserEntity::getId)
                        .orElse(null);
                } else if (principal instanceof String username && !"anonymousUser".equals(username)) {
                    adminId = userRepository.findByUsername(username)
                        .map(UserEntity::getId)
                        .orElse(null);
                }

                if (adminId != null) {
                    String actionType = auditableAction.actionType();
                    StringBuilder detailsBuilder = new StringBuilder("Method: " + joinPoint.getSignature().getName());
                    Object[] args = joinPoint.getArgs();
                    if (args.length > 0) {
                        detailsBuilder.append(" | Args count: ").append(args.length);
                    }

                    auditLogService.logAction(adminId, actionType, detailsBuilder.toString());
                } else {
                    log.warn("Audit log could not be saved: Admin ID could not be resolved from authentication principal.");
                }
            }
        } catch (Exception e) {
            log.error("Failed to record audit log for method: {}", joinPoint.getSignature().getName(), e);
        }
    }
}
