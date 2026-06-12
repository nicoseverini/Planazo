package com.planazo.plan.dto;

import com.planazo.plan.Plan;
import com.planazo.plan.PlanVisibility;
import com.planazo.common.constants.Interest;
import com.planazo.user.User;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;
import java.util.List;

public record PlanCreateDTO(
        @NotBlank String title,
        String description,
        @NotNull @Future LocalDateTime startDateTime,
        @NotNull LocalDateTime endDateTime,
        @NotNull PlanVisibility visibility,
        @Positive @Max(999999) Integer maxSubscribers,
        @Min(0) @Max(120) Integer minAge,
        @Min(0) @Max(120) Integer maxAge,
        List<Interest> interests,
        String location,
        Double latitude,
        Double longitude,
        List<String> images
) {
    public Plan asPlan(User creator) {
        return new Plan(
                title,
                description,
                startDateTime,
                endDateTime,
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
