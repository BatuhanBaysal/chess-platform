package com.batuhan.chess.application.service.user;

import com.batuhan.chess.api.dto.user.ChangePasswordRequest;
import com.batuhan.chess.api.dto.user.DeleteAccountRequest;
import com.batuhan.chess.api.dto.user.UpdateProfileRequest;
import com.batuhan.chess.api.dto.user.UserResponseDTO;
import com.batuhan.chess.api.exception.EmailAlreadyExistsException;
import com.batuhan.chess.api.exception.GameOperationException;
import com.batuhan.chess.api.exception.UserAlreadyExistsException;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.repository.UserRepository;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserEntity getCurrentUserEntity() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
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

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        UserEntity user = getCurrentUserEntity();

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new GameOperationException("Current password does not match");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    @Transactional
    @CacheEvict(value = "users", key = "#root.target.getCurrentUserEntity().username")
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
    @CacheEvict(value = "users", key = "#root.target.getCurrentUserEntity().username")
    public void deleteAccount(DeleteAccountRequest request) {
        UserEntity user = getCurrentUserEntity();

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new GameOperationException("Password verification failed while trying to delete the account.");
        }

        userRepository.delete(user);
    }
}
