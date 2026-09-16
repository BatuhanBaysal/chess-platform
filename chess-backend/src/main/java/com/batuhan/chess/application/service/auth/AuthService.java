package com.batuhan.chess.application.service.auth;

import com.batuhan.chess.api.dto.auth.AuthResponse;
import com.batuhan.chess.api.dto.auth.LoginRequest;
import com.batuhan.chess.api.dto.auth.RegisterRequest;
import com.batuhan.chess.api.exception.EmailAlreadyExistsException;
import com.batuhan.chess.api.exception.GameOperationException;
import com.batuhan.chess.api.exception.UserAlreadyExistsException;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import com.batuhan.chess.domain.repository.UserRepository;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String PARAM_USERNAME = "username";
    private static final String PARAM_PASSWORD = "password";
    private static final String KEY_ACCESS_TOKEN = "access_token";
    private static final String BEARER_PREFIX = "Bearer ";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    @Value("${keycloak.guest-client-id:chess-guest-client}")
    private String guestClientId;

    @Value("${keycloak.guest-client-secret:}")
    private String guestClientSecret;

    @Value("${keycloak.token-uri:http://localhost:8081/realms/chess-realm/protocol/openid-connect/token}")
    private String keycloakTokenUri;

    @Value("${keycloak.admin-username:admin}")
    private String keycloakAdminUsername;

    @Value("${keycloak.admin-password:admin}")
    private String keycloakAdminPassword;

    @Value("${keycloak.server-url:http://localhost:8081}")
    private String keycloakServerUrl;

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username already exists");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        createKeycloakUser(request.username(), request.email(), request.password(), "USER");
        UserEntity user = UserEntity.builder()
            .username(request.username())
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .role(UserRole.ROLE_USER)
            .build();

        userRepository.save(user);
        log.info("AUTH_ACTION: Successfully registered new user: {}", request.username());
    }

    @RateLimiter(name = "authService", fallbackMethod = "loginFallback")
    public AuthResponse login(LoginRequest request) {
        var user = userRepository.findByUsernameAndActiveTrue(request.usernameOrEmail())
            .or(() -> userRepository.findByEmailAndActiveTrue(request.usernameOrEmail()))
            .orElseThrow(() -> new UsernameNotFoundException("User not found or account is deleted: " + request.usernameOrEmail()));

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                user.getUsername(),
                request.password()
            )
        );

        String jwtToken = fetchUserTokenFromKeycloak(user.getUsername(), request.password());
        log.info("AUTH_ACTION: User successfully authenticated with Keycloak: {}", user.getUsername());

        return AuthResponse.builder()
            .id(user.getId())
            .token(jwtToken)
            .username(user.getUsername())
            .email(user.getEmail())
            .eloRating(user.getEloRating())
            .role(user.getRole())
            .build();
    }

    @Transactional
    @RateLimiter(name = "authService", fallbackMethod = "guestFallback")
    public AuthResponse loginAsGuest() {
        String guestUsername = "guest_" + UUID.randomUUID().toString().substring(0, 8);
        String guestPassword = UUID.randomUUID().toString();

        createKeycloakUser(guestUsername, guestUsername + "@chess.com", guestPassword, "GUEST");

        UserEntity guestUser = UserEntity.builder()
            .username(guestUsername)
            .email(guestUsername + "@chess.com")
            .password(passwordEncoder.encode(guestPassword))
            .role(UserRole.ROLE_GUEST)
            .eloRating(400)
            .isGuest(true)
            .active(true)
            .build();

        UserEntity savedUser = userRepository.save(guestUser);
        String jwtToken = fetchUserTokenFromKeycloak(guestUsername, guestPassword);
        log.info("AUTH_ACTION: Guest session successfully initialized for user: {}", guestUsername);

        return AuthResponse.builder()
            .id(savedUser.getId())
            .token(jwtToken)
            .username(savedUser.getUsername())
            .email(savedUser.getEmail())
            .eloRating(savedUser.getEloRating())
            .role(savedUser.getRole())
            .build();
    }

    private void createKeycloakUser(String username, String email, String password, String roleName) {
        try {
            RestClient restClient = RestClient.create();
            String adminToken = fetchKeycloakAdminToken();
            Map<String, Object> userPayload = buildKeycloakPayload(username, email, password);

            var response = restClient.post()
                .uri(keycloakServerUrl + "/admin/realms/chess-realm/users")
                .header(HttpHeaders.AUTHORIZATION, BEARER_PREFIX + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .body(userPayload)
                .retrieve()
                .toBodilessEntity();

            String location = response.getHeaders().getFirst(HttpHeaders.LOCATION);
            if (location != null) {
                String keycloakUserId = location.substring(location.lastIndexOf('/') + 1);
                assignRoleToUser(keycloakUserId, roleName, adminToken);
            }

            log.info("KEYCLOAK_SYNC: Created user account in Keycloak for username: {}", username);
        } catch (Exception e) {
            log.error("KEYCLOAK_ERROR: Failed to create Keycloak user {}: {}", username, e.getMessage());
            throw new GameOperationException("Failed to register user in Keycloak identity provider.");
        }
    }

    private void assignRoleToUser(String userId, String roleName, String adminToken) {
        try {
            RestClient restClient = RestClient.create();
            Map<String, Object> role = restClient.get()
                .uri(keycloakServerUrl + "/admin/realms/chess-realm/roles/" + roleName)
                .header(HttpHeaders.AUTHORIZATION, BEARER_PREFIX + adminToken)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

            if (role != null) {
                restClient.post()
                    .uri(keycloakServerUrl + "/admin/realms/chess-realm/users/" + userId + "/role-mappings/realm")
                    .header(HttpHeaders.AUTHORIZATION, BEARER_PREFIX + adminToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(List.of(role))
                    .retrieve()
                    .toBodilessEntity();
            }
        } catch (Exception e) {
            log.warn("KEYCLOAK_WARN: Failed to map {} role to user {}: {}", roleName, userId, e.getMessage());
        }
    }

    private String fetchKeycloakAdminToken() {
        RestClient restClient = RestClient.create();
        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("grant_type", PARAM_PASSWORD);
        formData.add("client_id", "admin-cli");
        formData.add(PARAM_USERNAME, keycloakAdminUsername);
        formData.add(PARAM_PASSWORD, keycloakAdminPassword);

        Map<String, Object> response = restClient.post()
            .uri(keycloakServerUrl + "/realms/master/protocol/openid-connect/token")
            .contentType(MediaType.APPLICATION_FORM_URLENCODED)
            .body(formData)
            .retrieve()
            .body(new ParameterizedTypeReference<>() {});

        if (response != null && response.get(KEY_ACCESS_TOKEN) != null) {
            return response.get(KEY_ACCESS_TOKEN).toString();
        }

        log.error("KEYCLOAK_ERROR: Admin access token response was empty or missing token");
        throw new GameOperationException("Failed to retrieve Keycloak admin access token.");
    }

    private Map<String, Object> buildKeycloakPayload(String username, String email, String password) {
        Map<String, Object> credential = Map.of(
            "type", PARAM_PASSWORD,
            "value", password,
            "temporary", false
        );

        return Map.of(
            PARAM_USERNAME, username,
            "firstName", username,
            "lastName", "User",
            "email", email,
            "enabled", true,
            "emailVerified", true,
            "requiredActions", Collections.emptyList(),
            "credentials", List.of(credential)
        );
    }

    private String fetchUserTokenFromKeycloak(String username, String password) {
        try {
            RestClient restClient = RestClient.create();
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("grant_type", PARAM_PASSWORD);
            formData.add("client_id", guestClientId);
            if (guestClientSecret != null && !guestClientSecret.isBlank()) {
                formData.add("client_secret", guestClientSecret);
            }
            formData.add(PARAM_USERNAME, username);
            formData.add(PARAM_PASSWORD, password);

            Map<String, Object> response = restClient.post()
                .uri(keycloakTokenUri)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formData)
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});

            if (response != null && response.get(KEY_ACCESS_TOKEN) != null) {
                return response.get(KEY_ACCESS_TOKEN).toString();
            }

            log.error("KEYCLOAK_ERROR: Access token field missing in response for user: {}", username);
            throw new GameOperationException("Failed to obtain access token for user.");
        } catch (Exception e) {
            log.error("KEYCLOAK_ERROR: Authentication failed for user {}: {}", username, e.getMessage());
            throw new GameOperationException("Failed to authenticate session with identity provider.");
        }
    }

    @SuppressWarnings("unused")
    public AuthResponse loginFallback(LoginRequest request, Throwable t) {
        log.warn("RATE_LIMIT: Login rate limit exceeded for user {}: {}", request.usernameOrEmail(), t.getMessage());
        throw new GameOperationException("Too many login attempts. Please try again later.");
    }

    @SuppressWarnings("unused")
    public AuthResponse guestFallback(Throwable t) {
        log.warn("RATE_LIMIT: Guest login rate limit exceeded: {}", t.getMessage());
        throw new GameOperationException("Too many guest login attempts. Please try again later.");
    }
}
