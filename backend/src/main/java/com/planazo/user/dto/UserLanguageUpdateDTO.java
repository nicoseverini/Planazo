package com.planazo.user.dto;

import jakarta.validation.constraints.NotBlank;

public record UserLanguageUpdateDTO(
        @NotBlank(message = "Preferred language is required") String preferredLanguage
) {}
