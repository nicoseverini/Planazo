package com.planazo.plan.dto;

public record PlanSubscriberDTO(
        Long id,
        String name,
        String lastname,
        String photo,
        Boolean accepted
) {}
