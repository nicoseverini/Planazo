package com.planazo.plan.dto;

import com.planazo.plan.PlanVisibility;
import com.planazo.common.constants.Interest;

import java.time.OffsetDateTime;
import java.util.List;

public record PlanSummaryDTO(

        Long id,

        String title,

        OffsetDateTime startDateTime,

        String location,

        String country,

        String city,

        String address,

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

        Double budget,

        String timezone

) {}
