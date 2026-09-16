package com.batuhan.chess.application.service.user;

import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import com.batuhan.chess.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserSyncService {

    private final UserRepository userRepository;

    @Transactional
    public UserEntity syncKeycloakUser(Jwt jwt, String username) {
        String email = jwt.getClaimAsString("email");
        if (email == null) {
            email = username + "@chessplatform.local";
        }

        UUID externalId;
        try {
            externalId = UUID.fromString(jwt.getSubject());
        } catch (IllegalArgumentException e) {
            externalId = UUID.randomUUID();
        }

        UserRole role = resolveRole(jwt);
        boolean isGuest = (role == UserRole.ROLE_GUEST) || username.startsWith("guest_");

        UserEntity newUser = UserEntity.builder()
            .externalId(externalId)
            .username(username)
            .email(email)
            .role(role)
            .active(true)
            .eloRating(1200)
            .totalWins(0)
            .totalLosses(0)
            .totalDraws(0)
            .isGuest(isGuest)
            .build();

        return userRepository.save(newUser);
    }

    @SuppressWarnings("unchecked")
    private UserRole resolveRole(Jwt jwt) {
        Map<String, Object> realmAccess = (Map<String, Object>) jwt.getClaims().get("realm_access");
        if (realmAccess != null && realmAccess.containsKey("roles")) {
            Collection<String> roles = (Collection<String>) realmAccess.get("roles");
            if (roles.contains("ADMIN")) {
                return UserRole.ROLE_ADMIN;
            }
            if (roles.contains("GUEST")) {
                return UserRole.ROLE_GUEST;
            }
        }
        return UserRole.ROLE_USER;
    }
}
