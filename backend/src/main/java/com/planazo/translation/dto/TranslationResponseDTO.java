package com.planazo.translation.dto;

public record TranslationResponseDTO(
    String translatedText,
    String sourceLanguage,
    String targetLanguage
) {}
