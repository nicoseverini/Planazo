package com.planazo.user.dto;

import jakarta.validation.constraints.Past;

import java.time.LocalDate;

public record UserUpdateDTO(
                String photo,
                String name,
                String lastname,
                String gender,
                String password,
                @Past(message = "Birth date must be in the past") LocalDate birthDate) {

}
