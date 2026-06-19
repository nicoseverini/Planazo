package com.planazo.turistic_place.dto;

import com.planazo.common.constants.Interest;

import java.util.List;

public record TuristicPlaceDetailDTO(
        Long id,
        String name,
        Double cost,
        Integer minAge,
        Integer maxAge,
        List<Interest> interests,
        String country,
        String city,
        String address,
        String location,
        Double latitude,
        Double longitude,
        List<String> images,
        String description,
        Long creatorId
) {}
