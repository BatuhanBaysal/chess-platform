package com.batuhan.chess.api.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ChangePasswordRequest(
    @NotBlank String currentPassword,

    @NotBlank
    @Pattern(regexp = "^(?=.*\\d)(?=.*[a-z]).{8,}$",
        message = "The new password must be at least 8 characters long and include one number and one letter.")
    String newPassword
) {}
