package com.planazo.translation.dto;

import jakarta.validation.constraints.NotBlank;

public record TranslationRequestDTO(
    @NotBlank(message = "Text is required") String text,
    @NotBlank(message = "Target language is required") String targetLanguage
) {}
