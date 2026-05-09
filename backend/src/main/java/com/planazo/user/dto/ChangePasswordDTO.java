package com.planazo.user.dto;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordDTO(
    @NotBlank String token,
    @NotBlank String newPassword
) {}