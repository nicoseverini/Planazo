package com.planazo.turistic_place.dto;

import com.planazo.common.constants.Interest;

import java.time.LocalDateTime;
import java.util.List;

public record TuristicPlaceSummaryDTO(
        Long id,
        String name,
        Double cost,
        String location,
        Double latitude,
        Double longitude,
        Integer minAge,
        Integer maxAge,
        Interest interest,
        List<String> images
) {
}