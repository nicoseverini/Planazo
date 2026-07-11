package com.planazo.geocoding.dto;

public record GeocodeResultDTO(
    double latitude,
    double longitude,
    String displayName
) {}
