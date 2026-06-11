package com.planazo.plan.dto;

import com.planazo.plan.PlanVisibility;
import com.planazo.common.constants.Interest;
import com.planazo.common.constants.TravelType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;
import java.util.List;

public record PlanUpdateDTO(

        String title,

        String description,

        LocalDateTime dateTime,

        Integer durationMinutes,

        PlanVisibility visibility,

        Integer maxSubscribers,

        @Min(0) @Max(120) Integer minAge,

        @Min(0) @Max(120) Integer maxAge,

        List<Interest> interests,

        TravelType travelType,

        String location,

        Double latitude,

        Double longitude,

        List<String> images

) {}