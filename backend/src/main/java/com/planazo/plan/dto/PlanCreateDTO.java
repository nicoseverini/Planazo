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
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

public record PlanCreateDTO(
        @NotBlank(message = "Plan title is required.") String title,
        String description,
        @NotNull(message = "Start date and time is required.")
        @Future(message = "Start date and time must be set in the future.")
        OffsetDateTime startDateTime,
        @NotNull(message = "End date and time is required.") OffsetDateTime endDateTime,
        @NotNull PlanVisibility visibility,
        @Positive @Max(999999) Integer maxSubscribers,
        @Min(0) @Max(120) Integer minAge,
        @Min(0) @Max(120) Integer maxAge,
        @NotEmpty(message = "At least one interest must be selected") List<Interest> interests,
        String location,
        Double latitude,
        Double longitude,
        List<String> images,
        @DecimalMin(value = "0.0", message = "Budget must be at least 0")
        @DecimalMax(value = "9999999.0", message = "Budget cannot exceed 9,999,999")
        Double budget
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
                location,
                latitude,
                longitude,
                images,
                creator
        );
    }
}
