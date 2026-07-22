package com.planazo.geocoding.dto;

public record ReverseGeocodeResultDTO(
    String country,
    String countryCode,
    String state,
    String city,
    String street,
    String streetNumber,
    String displayName
) {}
