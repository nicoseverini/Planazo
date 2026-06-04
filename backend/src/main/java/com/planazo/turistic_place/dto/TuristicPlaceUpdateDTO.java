package com.planazo.turistic_place.dto;

import com.planazo.common.constants.Interest;

import java.util.List;

public record TuristicPlaceUpdateDTO(
        String name,
        Double cost,
        Integer minAge,
        Integer maxAge,
        Interest interest,
        String location,
        Double latitude,
        Double longitude,
        List<String> images,
        String description
) {
}