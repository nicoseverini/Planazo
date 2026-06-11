package com.planazo.turistic_place.dto;

import com.planazo.common.constants.Interest;
import com.planazo.turistic_place.TuristicPlace;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record TuristicPlaceCreateDTO(
        @NotBlank String name,
        @NotNull Double cost,
        @Min(0) @Max(120) Integer minAge,
        @Min(0) @Max(120) Integer maxAge,
        @NotNull Interest interest,
        String location,
        Double latitude,
        Double longitude,
        List<String> images,
        String description
) {
    public TuristicPlace asTuristicPlace() {
        TuristicPlace place = new TuristicPlace(
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
        place.setDescription(description);
        return place;
    }
}