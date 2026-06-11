package com.planazo.turistic_place.dto;

import com.planazo.common.constants.Interest;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;

public record TuristicPlaceUpdateDTO(
        String name,
        Double cost,
        @Min(0) @Max(120) Integer minAge,
        @Min(0) @Max(120) Integer maxAge,
        Interest interest,
        String location,
        Double latitude,
        Double longitude,
        List<String> images,
        String description
) {
}