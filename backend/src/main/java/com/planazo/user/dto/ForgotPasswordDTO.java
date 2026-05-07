package com.planazo.user.dto;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordDTO(
    @NotBlank String email
) {}