package com.planazo.translation.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GeminiRequest(
    List<Content> contents,
    SystemInstruction systemInstruction
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Content(
        String role,
        List<Part> parts
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record SystemInstruction(
        List<Part> parts
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Part(
        String text
    ) {}
}
