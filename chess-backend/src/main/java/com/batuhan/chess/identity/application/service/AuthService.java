package com.batuhan.chess.identity.application.service;

import com.batuhan.chess.identity.api.dto.auth.AuthResponseDTO;
import com.batuhan.chess.identity.api.dto.auth.LoginRequestDTO;
import com.batuhan.chess.identity.api.dto.auth.RegisterRequestDTO;
import com.batuhan.chess.identity.domain.model.UserEntity;
import com.batuhan.chess.identity.domain.model.UserRole;
import com.batuhan.chess.identity.domain.repository.UserRepository;
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

    public void register(RegisterRequestDTO request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already exists");
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

    public AuthResponseDTO login(LoginRequestDTO request) {
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

        return AuthResponseDTO.builder()
            .token(jwtToken)
            .username(user.getUsername())
            .email(user.getEmail())
            .eloRating(user.getEloRating())
            .build();
    }

    public AuthResponseDTO loginAsGuest() {
        String guestUsername = "guest_" + UUID.randomUUID().toString().substring(0, 8);

        UserEntity guestUser = UserEntity.builder()
            .username(guestUsername)
            .email(guestUsername + "@chess.com")
            .password(passwordEncoder.encode("guest_password"))
            .role(UserRole.ROLE_USER)
            .isGuest(true)
            .eloRating(400)
            .build();

        userRepository.save(guestUser);

        var userDetails = org.springframework.security.core.userdetails.User.builder()
            .username(guestUser.getUsername())
            .password(guestUser.getPassword())
            .roles("USER")
            .build();

        String jwtToken = jwtService.generateToken(userDetails);

        return AuthResponseDTO.builder()
            .token(jwtToken)
            .username(guestUser.getUsername())
            .email(guestUser.getEmail())
            .eloRating(guestUser.getEloRating())
            .isGuest(true)
            .build();
    }
}
