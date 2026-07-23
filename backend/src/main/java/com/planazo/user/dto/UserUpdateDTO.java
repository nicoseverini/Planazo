package com.planazo.user.dto;

import com.planazo.common.constants.Interest;
import com.planazo.common.constants.TravelType;
import jakarta.validation.constraints.Past;

import java.time.LocalDate;
import java.util.List;

public record UserUpdateDTO(
                String photo,
                String name,
                String lastname,
                String gender,
                String password,
                @Past(message = "Birth date must be in the past") LocalDate birthDate,
                List<Interest> interests,
                TravelType travelType,
                List<String> languages) {

}
