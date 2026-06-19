package com.planazo.turistic_place.dto;

import com.planazo.common.constants.Interest;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.List;

public record TuristicPlaceUpdateDTO(
        @Size(max = 100, message = "Name must be 100 characters or less.")
        String name,

        @DecimalMin(value = "0.0", message = "Cost must be at least 0.")
        @DecimalMax(value = "9999999.0", message = "Cost cannot exceed 9,999,999.")
        Double cost,

        @Min(value = 0, message = "Minimum age must be between 0 and 120.")
        @Max(value = 120, message = "Minimum age must be between 0 and 120.")
        Integer minAge,

        @Min(value = 0, message = "Maximum age must be between 0 and 120.")
        @Max(value = 120, message = "Maximum age must be between 0 and 120.")
        Integer maxAge,

        // null = don't touch; non-null must have at least one element
        @Size(min = 1, message = "At least one category must be selected.")
        List<Interest> interests,

        @Size(max = 100, message = "Country must be 100 characters or less.")
        String country,

        @Size(max = 100, message = "City must be 100 characters or less.")
        String city,

        @Size(max = 255, message = "Address must be 255 characters or less.")
        String address,

        Double latitude,
        Double longitude,
        List<String> images,

        @Size(max = 1000, message = "Description must be 1,000 characters or less.")
        String description
) {}
