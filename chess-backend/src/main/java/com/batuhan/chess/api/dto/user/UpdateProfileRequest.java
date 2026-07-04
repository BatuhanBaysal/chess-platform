package com.batuhan.chess.api.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @NotBlank @Size(min = 3, max = 20)
    String username,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email
) {}
