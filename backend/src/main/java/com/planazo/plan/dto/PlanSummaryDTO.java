package com.planazo.plan.dto;

import com.planazo.plan.PlanVisibility;
import com.planazo.common.constants.Interest;

import java.time.LocalDateTime;
import java.util.List;

public record PlanSummaryDTO(

        Long id,

        String title,

        LocalDateTime startDateTime,

        String location,

        Double latitude,

        Double longitude,

        List<Interest> interests,

        PlanVisibility visibility,

        int subscriberCount,

        Integer maxSubscribers,

        Integer minAge,

        String creatorName,

        Long creatorId,

        List<String> images,

        Boolean accepted,

        Double budget

) {}
