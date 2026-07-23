package com.planazo.plan.dto;

import com.planazo.plan.PlanVisibility;
import com.planazo.common.constants.Interest;

import java.time.OffsetDateTime;
import java.util.List;

public record PlanDetailDTO(

        Long id,

        String title,

        String description,

        OffsetDateTime startDateTime,

        OffsetDateTime endDateTime,

        Integer durationMinutes,

        PlanVisibility visibility,

        Integer maxSubscribers,

        Integer minAge,

        Integer maxAge,

        List<Interest> interests,

        String location,

        String country,

        String state,

        String city,

        String address,

        Double latitude,

        Double longitude,

        List<String> images,

        Long creatorId,

        String creatorName,

        int subscriberCount,

        boolean isFull,

        Double budget,

        String timezone

) {}
