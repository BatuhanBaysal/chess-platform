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
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final FileStoragePort fileStoragePort;

    public UserEntity getCurrentUserEntity() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
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

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new GameOperationException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
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
