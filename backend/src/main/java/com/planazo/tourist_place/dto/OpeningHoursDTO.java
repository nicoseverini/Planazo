package com.planazo.tourist_place.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.DayOfWeek;
import java.time.LocalTime;

/**
 * A single open day in a tourist place's weekly schedule. Only open days are exchanged; a day
 * missing from the list is closed. Times are 24-hour {@code HH:mm}. Business rules
 * (both times present, closing later than opening, no duplicate days) are enforced in the service.
 */
public record OpeningHoursDTO(
        @Schema(example = "MONDAY")
        DayOfWeek dayOfWeek,

        @Schema(type = "string", example = "09:00")
        LocalTime openTime,

        @Schema(type = "string", example = "18:00")
        LocalTime closeTime
) {}
