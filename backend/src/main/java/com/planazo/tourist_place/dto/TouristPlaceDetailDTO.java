package com.planazo.tourist_place.dto;

import com.planazo.common.constants.Interest;

import java.util.List;

public record TouristPlaceDetailDTO(
        Long id,
        String name,
        Double cost,
        Integer minAge,
        Integer maxAge,
        List<Interest> interests,
        String country,
        String state,
        String city,
        String address,
        String location,
        Double latitude,
        Double longitude,
        List<String> images,
        String description,
        Long creatorId,
        List<OpeningHoursDTO> openingHours
) {}
