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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    private static final String GUEST_DUMMY_PASSWORD_HASH = "$2a$10$DummyHashForGuestUsersOptimizationOnlyToAvoidHeavyCpuLoad";

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new UserAlreadyExistsException("Username already exists");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyExistsException("Email already exists");
        }

        UserEntity user = UserEntity.builder()
            .username(request.username())
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .role(UserRole.ROLE_USER)
            .build();

        userRepository.save(user);
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

        var userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPassword())
            .roles(user.getRole().name().replace("ROLE_", ""))
            .build();

        String jwtToken = jwtService.generateToken(userDetails);

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

        UserEntity guestUser = UserEntity.builder()
            .username(guestUsername)
            .email(guestUsername + "@chess.com")
            .password(GUEST_DUMMY_PASSWORD_HASH)
            .role(UserRole.ROLE_GUEST)
            .eloRating(400)
            .build();

        UserEntity savedUser = userRepository.save(guestUser);

        var userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(savedUser.getUsername())
            .password(savedUser.getPassword())
            .roles(savedUser.getRole().name().replace("ROLE_", ""))
            .build();

        String jwtToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
            .id(savedUser.getId())
            .token(jwtToken)
            .username(savedUser.getUsername())
            .email(savedUser.getEmail())
            .eloRating(savedUser.getEloRating())
            .role(savedUser.getRole())
            .build();
    }

    @SuppressWarnings("unused")
    public AuthResponse loginFallback(LoginRequest request, Throwable t) {
        log.warn("Login rate limit exceeded for user {}: {}", request.usernameOrEmail(), t.getMessage());
        throw new GameOperationException("Too many login attempts. Please try again later.");
    }

    @SuppressWarnings("unused")
    public AuthResponse guestFallback(Throwable t) {
        log.warn("Guest login rate limit exceeded: {}", t.getMessage());
        throw new GameOperationException("Too many guest login attempts. Please try again later.");
    }
}
