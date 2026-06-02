package com.planazo.turistic_place.dto;

import com.planazo.common.constants.Interest;
import com.planazo.turistic_place.TuristicPlace;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

public record TuristicPlaceCreateDTO(
        @NotBlank String name,
        @NotNull Double cost,
        Integer minAge,
        Integer maxAge,
        @NotNull Interest interest,
        String location,
        Double latitude,
        Double longitude,
        List<String> images
) {
    public TuristicPlace asTuristicPlace() {
        return new TuristicPlace(
                name,
                cost,
                minAge,
                maxAge,
                interest,
                location,
                latitude,
                longitude,
                images
        );
    }
}