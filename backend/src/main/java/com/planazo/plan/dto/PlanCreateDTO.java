package com.planazo.plan.dto;

import com.planazo.plan.Plan;
import com.planazo.plan.PlanVisibility;
import com.planazo.common.constants.Interest;
import com.planazo.user.User;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

public record PlanCreateDTO(
        @NotBlank(message = "Plan title is required.") 
        @Size(max = 100, message = "Plan title must be 100 characters or less.")
        String title,
        @Size(max = 1000, message = "Description must be 1,000 characters or less.")
        String description,
        @NotNull(message = "Start date and time is required.")
        @Future(message = "Start date and time must be set in the future.")
        OffsetDateTime startDateTime,
        @NotNull(message = "End date and time is required.") OffsetDateTime endDateTime,
        @NotNull PlanVisibility visibility,
        @Min(value = 1, message = "Max participants must be between 1 and 99,999.")
        @Max(value = 99999, message = "Max participants must be between 1 and 99,999.")
        Integer maxSubscribers,
        @Min(value = 0, message = "Minimum age must be between 0 and 120.")
        @Max(value = 120, message = "Minimum age must be between 0 and 120.")
        Integer minAge,
        @Min(value = 0, message = "Maximum age must be between 0 and 120.")
        @Max(value = 120, message = "Maximum age must be between 0 and 120.")
        Integer maxAge,
        @NotEmpty(message = "At least one interest must be selected") List<Interest> interests,
        @NotBlank(message = "Country is required.")
        @Size(max = 100, message = "Country must be 100 characters or less.")
        String country,
        @Size(max = 100, message = "State must be 100 characters or less.")
        String state,
        @NotBlank(message = "City is required.")
        @Size(max = 100, message = "City must be 100 characters or less.")
        String city,
        @NotBlank(message = "Address is required.")
        @Size(max = 255, message = "Address must be 255 characters or less.")
        String address,
        Double latitude,
        Double longitude,
        List<String> images,
        @DecimalMin(value = "0.0", message = "Budget must be between 0 and 9,999,999")
        @DecimalMax(value = "9999999.0", message = "Budget must be between 0 and 9,999,999")
        Double budget,
        @NotBlank(message = "Time zone is required. Please use a valid IANA time zone identifier (e.g., \"America/New_York\", \"Europe/Madrid\").")
        String timezone
) {
    public Plan asPlan(User creator) {
        return new Plan(
                title,
                description,
                startDateTime.withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime(),
                endDateTime.withOffsetSameInstant(ZoneOffset.UTC).toLocalDateTime(),
                visibility,
                maxSubscribers,
                minAge,
                maxAge,
                interests,
                country,
                state,
                city,
                address,
                latitude,
                longitude,
                images,
                creator,
                timezone
        );
    }
}
