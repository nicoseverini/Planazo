package com.planazo.plan.dto;

import com.planazo.plan.PlanVisibility;
import com.planazo.common.constants.Interest;
import com.planazo.common.constants.TravelType;
import java.time.LocalDateTime;
import java.util.List;

public record PlanUpdateDTO(

        String title,

        String description,

        LocalDateTime dateTime,

        Integer durationMinutes,

        PlanVisibility visibility,

        Integer maxSubscribers,

        Integer minAge,

        Integer maxAge,

        Interest interest,

        TravelType travelType,

        String location,

        Double latitude,

        Double longitude,

        List<String> images

) {}