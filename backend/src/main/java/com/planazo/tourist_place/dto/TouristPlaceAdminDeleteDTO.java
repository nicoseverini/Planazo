package com.planazo.tourist_place.dto;

import jakarta.validation.constraints.Size;

public record TouristPlaceAdminDeleteDTO(
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    String reason
) {}
