package com.batuhan.chess.api.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @NotBlank @Size(min = 3, max = 20)
    String username,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format", regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")
    String email
) {}
