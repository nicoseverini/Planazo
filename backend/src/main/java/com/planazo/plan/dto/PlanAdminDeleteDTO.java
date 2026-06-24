package com.planazo.plan.dto;

import jakarta.validation.constraints.Size;

public record PlanAdminDeleteDTO(
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    String reason
) {}
