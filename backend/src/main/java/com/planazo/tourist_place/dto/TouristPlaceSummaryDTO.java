package com.planazo.tourist_place.dto;

import com.planazo.common.constants.Interest;

import java.util.List;

public record TouristPlaceSummaryDTO(
        Long id,
        String name,
        Double cost,
        List<Interest> interests,
        String country,
        String city,
        String address,
        String location,
        Double latitude,
        Double longitude,
        Integer minAge,
        Integer maxAge,
        List<String> images,
        Long creatorId,
        String creatorName
) {}
