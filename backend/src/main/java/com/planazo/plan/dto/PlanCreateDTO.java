package com.planazo.plan.dto;

import com.planazo.plan.Plan;
import com.planazo.plan.PlanVisibility;
import com.planazo.common.constants.Interest;
import com.planazo.common.constants.TravelType;
import com.planazo.user.User;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public record PlanCreateDTO(
        @NotBlank String title,
        String description,
        @NotNull @Future LocalDateTime dateTime,
        Integer durationMinutes,
        @NotNull PlanVisibility visibility,
        Integer maxSubscribers,
        Integer minAge,
        Integer maxAge,
        Interest interest,
        TravelType travelType,
        String location,
        Double latitude,
        Double longitude,
        List<String> images

) {

    public Plan asPlan(User creator) {
        return new Plan(
                title,
                description,
                dateTime,
                durationMinutes,
                visibility,
                maxSubscribers,
                minAge,
                maxAge,
                interest,
                travelType,
                location,
                latitude,
                longitude,
                images,
                creator
        );
    }
}