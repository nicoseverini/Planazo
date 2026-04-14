package com.planazo.user.dto;

import com.planazo.user.UserCredentials;
import jakarta.validation.constraints.NotBlank;

public record UserLoginDTO(
        @NotBlank String email,
        @NotBlank String password
) implements UserCredentials {}