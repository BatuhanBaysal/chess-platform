package com.batuhan.chess.application.service.user;

import com.batuhan.chess.api.dto.storage.FileDownloadDTO;
import com.batuhan.chess.api.dto.user.*;
import com.batuhan.chess.api.exception.EmailAlreadyExistsException;
import com.batuhan.chess.api.exception.GameOperationException;
import com.batuhan.chess.api.exception.ResourceNotFoundException;
import com.batuhan.chess.api.exception.UserAlreadyExistsException;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.FileStoragePort;
import com.batuhan.chess.domain.repository.UserRepository;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStoragePort fileStoragePort;
    private final UserSyncService userSyncService;
    private final Keycloak keycloak;

    @Value("${KEYCLOAK_SERVER_URL:http://keycloak:8081}")
    private String keycloakServerUrl;

    @Value("${keycloak.guest-client-id:chess-guest-client}")
    private String guestClientId;

    @Value("${keycloak.guest-client-secret:}")
    private String guestClientSecret;

    private static final String REALM = "chess-realm";

    public UserEntity getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            String username = jwt.getClaimAsString("preferred_username");
            if (username == null) {
                username = jwt.getSubject();
            }

            final String finalUsername = username;
            return userRepository.findByUsernameAndActiveTrue(finalUsername)
                .orElseGet(() -> userSyncService.syncKeycloakUser(jwt, finalUsername));
        }

        String username = authentication.getName();
        return userRepository.findByUsernameAndActiveTrue(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }

    public UserResponseDTO getProfile() {
        UserEntity user = getCurrentUserEntity();
        return UserResponseDTO.builder()
            .username(user.getUsername())
            .email(user.getEmail())
            .eloRating(user.getEloRating())
            .totalWins(user.getTotalWins())
            .totalLosses(user.getTotalLosses())
            .totalDraws(user.getTotalDraws())
            .role(user.getRole())
            .build();
    }

    @Cacheable(value = "leaderboard", unless = "#result.isEmpty()")
    public List<UserResponseDTO> getLeaderboard() {
        return userRepository.findTop3ByOrderByEloRatingDesc(PageRequest.of(0, 3))
            .stream()
            .map(user -> UserResponseDTO.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .eloRating(user.getEloRating())
                .totalWins(user.getTotalWins())
                .totalLosses(user.getTotalLosses())
                .totalDraws(user.getTotalDraws())
                .totalGames(user.getTotalGames())
                .role(user.getRole())
                .build())
            .toList();
    }

    public List<UserResponseDTO> getPagedLeaderboard(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAllByActiveTrueOrderByEloRatingDesc(pageable)
            .stream()
            .map(user -> UserResponseDTO.builder()
                .username(user.getUsername())
                .eloRating(user.getEloRating())
                .totalWins(user.getTotalWins())
                .totalLosses(user.getTotalLosses())
                .totalDraws(user.getTotalDraws())
                .totalGames(user.getTotalGames())
                .build())
            .toList();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        UserEntity user = getCurrentUserEntity();

        try {
            if (user.getExternalId() == null) {
                throw new GameOperationException("User externalId is missing, cannot update password.");
            }

            String testToken = fetchUserTokenFromKeycloak(user.getUsername(), request.currentPassword());
            if (testToken == null) {
                throw new GameOperationException("Current password does not match");
            }

            String keycloakUserId = user.getExternalId().toString();
            var userResource = keycloak.realm(REALM).users().get(keycloakUserId);

            CredentialRepresentation credential = new CredentialRepresentation();
            credential.setType(CredentialRepresentation.PASSWORD);
            credential.setValue(request.newPassword());
            credential.setTemporary(false);

            userResource.resetPassword(credential);

            user.setPassword(passwordEncoder.encode(request.newPassword()));
            userRepository.save(user);

            log.info("AUTH_ACTION: Password successfully updated and synchronized in Keycloak and DB for user: {}", user.getUsername());

        } catch (Exception e) {
            throw new GameOperationException("Failed to change password: " + e.getMessage());
        }
    }

    private String fetchUserTokenFromKeycloak(String username, String password) {
        try {
            RestClient restClient = RestClient.create();
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("grant_type", "password");
            formData.add("client_id", guestClientId);
            if (guestClientSecret != null && !guestClientSecret.isBlank()) {
                formData.add("client_secret", guestClientSecret);
            }
            formData.add("username", username);
            formData.add("password", password);

            var response = restClient.post()
                .uri(keycloakServerUrl + "/realms/chess-realm/protocol/openid-connect/token")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formData)
                .retrieve()
                .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response != null && response.get("access_token") != null) {
                return response.get("access_token").toString();
            }
        } catch (Exception e) {
            log.error("KEYCLOAK_TOKEN_ERROR: Failed to fetch token for user {} using client {}. Reason: {}", username, guestClientId, e.getMessage());
        }
        return null;
    }

    public AvatarUploadResponse uploadAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Avatar file cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals(MediaType.IMAGE_PNG_VALUE) && !contentType.equals(MediaType.IMAGE_JPEG_VALUE))) {
            throw new IllegalArgumentException("Only PNG and JPEG formats are supported");
        }

        if (file.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("Avatar size must not exceed 2MB");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String extension = contentType.equals(MediaType.IMAGE_PNG_VALUE) ? ".png" : ".jpg";
        String storageKey = "avatars/" + username + extension;

        try {
            fileStoragePort.uploadFile(storageKey, file.getInputStream(), file.getSize(), contentType);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read avatar file stream", e);
        }

        return new AvatarUploadResponse("/api/users/" + username + "/avatar", "Avatar uploaded successfully");
    }

    public FileDownloadDTO getAvatar(String username) {
        String baseKey = "avatars/" + username;
        String key = fileStoragePort.doesFileExist(baseKey + ".png") ? baseKey + ".png" : baseKey + ".jpg";

        if (!fileStoragePort.doesFileExist(key)) {
            throw new ResourceNotFoundException("Avatar not found for user: " + username);
        }

        byte[] data = fileStoragePort.downloadFile(key);
        String contentType = key.endsWith(".png") ? MediaType.IMAGE_PNG_VALUE : MediaType.IMAGE_JPEG_VALUE;
        return new FileDownloadDTO(data, contentType, username + (key.endsWith(".png") ? ".png" : ".jpg"));
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    @RateLimiter(name = "profileUpdateLimiter")
    public void updateProfile(UpdateProfileRequest request) {
        UserEntity user = getCurrentUserEntity();

        if (!user.getUsername().equals(request.username())) {
            if (userRepository.existsByUsername(request.username())) {
                throw new UserAlreadyExistsException("Username '" + request.username() + "' is already taken.");
            }
            user.setUsername(request.username());
        }

        if (!user.getEmail().equals(request.email())) {
            if (userRepository.existsByEmail(request.email())) {
                throw new EmailAlreadyExistsException("Email '" + request.email() + "' is already in use.");
            }
            user.setEmail(request.email());
        }

        userRepository.save(user);

        try {
            if (user.getExternalId() == null) {
                throw new GameOperationException("User externalId is missing, cannot sync with Keycloak.");
            }

            String keycloakUserId = user.getExternalId().toString();
            var userResource = keycloak.realm(REALM).users().get(keycloakUserId);
            var userRep = userResource.toRepresentation();
            userRep.setUsername(request.username());
            userRep.setEmail(request.email());
            userResource.update(userRep);
        } catch (Exception e) {
            throw new GameOperationException("Failed to update user in Keycloak: " + e.getMessage());
        }
    }

    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void deleteAccount(DeleteAccountRequest request) {
        UserEntity user = getCurrentUserEntity();

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new GameOperationException("Password verification failed while trying to delete the account.");
        }

        user.setActive(false);
        userRepository.save(user);
    }
}
