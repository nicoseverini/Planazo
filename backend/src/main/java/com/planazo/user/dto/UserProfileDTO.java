package com.planazo.user.dto;

import com.planazo.user.Interest;
import com.planazo.user.TravelType;

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
        Integer budget,
        TravelType travelType,
        List<String> languages
) {}