package com.planazo.turistic_place.dto;

import jakarta.validation.constraints.Size;

public record TuristicPlaceAdminDeleteDTO(
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    String reason
) {}
