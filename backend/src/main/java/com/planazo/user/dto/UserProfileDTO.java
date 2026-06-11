package com.planazo.user.dto;

import com.planazo.common.constants.Interest;
import com.planazo.common.constants.TravelType;

import java.time.LocalDate;
import java.util.List;

public record UserProfileDTO(
        Long id,
        String email,
        String name,
        String lastname,
        String photo,
        String gender,
        LocalDate birthDate,
        List<Interest> interests,
        TravelType travelType,
        List<String> languages
) {}