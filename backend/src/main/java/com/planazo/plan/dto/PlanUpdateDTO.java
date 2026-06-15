package com.planazo.plan.dto;

import com.planazo.plan.PlanVisibility;
import com.planazo.common.constants.Interest;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

public record PlanUpdateDTO(

        String title,

        String description,

        LocalDateTime startDateTime,

        LocalDateTime endDateTime,

        PlanVisibility visibility,

        @Min(value = 1, message = "Max participants must be between 1 and 99,999.")
        @Max(value = 99999, message = "Max participants must be between 1 and 99,999.")
        Integer maxSubscribers,

        @Min(0) @Max(120) Integer minAge,

        @Min(0) @Max(120) Integer maxAge,

        @Size(min = 1, message = "At least one interest must be selected") List<Interest> interests,

        String location,

        Double latitude,

        Double longitude,

        List<String> images,

        @DecimalMin(value = "0.0", message = "Budget must be at least 0")
        @DecimalMax(value = "9999999.0", message = "Budget cannot exceed 9,999,999")
        Double budget

) {}
