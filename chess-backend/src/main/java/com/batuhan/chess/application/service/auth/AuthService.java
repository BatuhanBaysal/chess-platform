package com.batuhan.chess.application.service.auth;

import com.batuhan.chess.api.dto.auth.AuthResponse;
import com.batuhan.chess.api.dto.auth.LoginRequest;
import com.batuhan.chess.api.dto.auth.RegisterRequest;
import com.batuhan.chess.api.exception.EmailAlreadyExistsException;
import com.batuhan.chess.api.exception.UserAlreadyExistsException;
import com.batuhan.chess.domain.model.user.UserEntity;
import com.batuhan.chess.domain.model.user.UserRole;
import com.batuhan.chess.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

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
            .isGuest(false)
            .build();

        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.username(),
                request.password()
            )
        );

        var user = userRepository.findByUsername(request.username())
            .orElseThrow(() -> new RuntimeException("User not found"));

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
            .isGuest(user.isGuest())
            .build();
    }

    public AuthResponse loginAsGuest() {
        String guestUsername = "guest_" + UUID.randomUUID().toString().substring(0, 8);

        UserEntity guestUser = UserEntity.builder()
            .username(guestUsername)
            .email(guestUsername + "@chess.com")
            .password(passwordEncoder.encode(UUID.randomUUID().toString()))
            .role(UserRole.ROLE_USER)
            .isGuest(true)
            .eloRating(400)
            .build();

        UserEntity savedUser = userRepository.save(guestUser);

        var userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(savedUser.getUsername())
            .password(savedUser.getPassword())
            .roles("USER")
            .build();

        String jwtToken = jwtService.generateToken(userDetails);

        return AuthResponse.builder()
            .id(savedUser.getId())
            .token(jwtToken)
            .username(savedUser.getUsername())
            .email(savedUser.getEmail())
            .eloRating(savedUser.getEloRating())
            .isGuest(true)
            .build();
    }
}
