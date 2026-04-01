package com.batuhan.chess.identity.api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequestDTO(
    @NotBlank @Size(min = 3, max = 20)
    String username,
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,
    @NotBlank @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z]).{8,}$", message = "The password must be at least 8 characters long and include both letters and numbers.")
    String password
) {}
