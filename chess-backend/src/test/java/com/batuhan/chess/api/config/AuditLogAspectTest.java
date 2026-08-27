package com.batuhan.chess.api.config;

import com.batuhan.chess.api.config.audit.AuditLogAspect;
import com.batuhan.chess.api.config.audit.AuditableAction;
import com.batuhan.chess.application.service.admin.AuditLogService;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.UserRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.reflect.MethodSignature;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuditLogAspect Unit Tests")
class AuditLogAspectTest {

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JoinPoint joinPoint;

    @Mock
    private MethodSignature methodSignature;

    @Mock
    private AuditableAction auditableAction;

    @Mock
    private Authentication authentication;

    @Mock
    private SecurityContext securityContext;

    @InjectMocks
    private AuditLogAspect auditLogAspect;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should log action successfully when principal is UserEntity")
    void shouldLogActionWhenPrincipalIsUserEntity() {
        // Arrange
        UserEntity userEntity = new UserEntity();
        userEntity.setId(42L);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userEntity);

        when(auditableAction.actionType()).thenReturn("UPDATE_ROLE");
        when(joinPoint.getSignature()).thenReturn(methodSignature);
        when(methodSignature.getName()).thenReturn("updateUserRole");
        when(joinPoint.getArgs()).thenReturn(new Object[]{1L, "ADMIN"});

        // Act
        auditLogAspect.logAdminAction(joinPoint, auditableAction);

        // Assert
        verify(auditLogService).logAction(
            42L,
            "UPDATE_ROLE",
            "Method: updateUserRole | Args count: 2"
        );
        verifyNoInteractions(userRepository);
    }

    @Test
    @DisplayName("Should resolve admin ID from UserDetails and log action")
    void shouldLogActionWhenPrincipalIsUserDetails() {
        // Arrange
        UserDetails userDetails = org.springframework.security.core.userdetails.User
            .withUsername("admin_user")
            .password("password")
            .authorities("ADMIN")
            .build();

        UserEntity userEntity = new UserEntity();
        userEntity.setId(10L);

        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        when(userRepository.findByUsernameAndActiveTrue("admin_user")).thenReturn(Optional.of(userEntity));

        when(auditableAction.actionType()).thenReturn("DELETE_USER");
        when(joinPoint.getSignature()).thenReturn(methodSignature);
        when(methodSignature.getName()).thenReturn("deleteUser");
        when(joinPoint.getArgs()).thenReturn(new Object[]{5L});

        // Act
        auditLogAspect.logAdminAction(joinPoint, auditableAction);

        // Assert
        verify(userRepository).findByUsernameAndActiveTrue("admin_user");
        verify(auditLogService).logAction(
            10L,
            "DELETE_USER",
            "Method: deleteUser | Args count: 1"
        );
    }

    @Test
    @DisplayName("Should not log action when exception occurs inside aspect and catch it gracefully")
    void shouldHandleExceptionGracefully() {
        // Arrange
        when(securityContext.getAuthentication()).thenThrow(new RuntimeException("Security error"));
        SecurityContextHolder.setContext(securityContext);
        when(joinPoint.getSignature()).thenReturn(methodSignature);
        when(methodSignature.getName()).thenReturn("someMethod");

        // Act & Assert
        assertDoesNotThrow(() ->
            auditLogAspect.logAdminAction(joinPoint, auditableAction)
        );

        verifyNoInteractions(auditLogService);
    }
}
