package com.planazo.plan.dto;

import com.planazo.plan.PlanVisibility;
import com.planazo.common.constants.Interest;

import java.time.LocalDateTime;
import java.util.List;

public record PlanDetailDTO(

        Long id,

        String title,

        String description,

        LocalDateTime startDateTime,

        LocalDateTime endDateTime,

        Integer durationMinutes,

        PlanVisibility visibility,

        Integer maxSubscribers,

        Integer minAge,

        Integer maxAge,

        List<Interest> interests,

        String location,

        Double latitude,

        Double longitude,

        List<String> images,

        Long creatorId,

        String creatorName,

        int subscriberCount,

        boolean isFull

) {}
