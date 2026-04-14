package com.planazo.user.dto;

import com.planazo.user.User;
import com.planazo.user.UserCredentials;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.function.Function;

public record UserCreateDTO(
        @NotNull @Email(message = "Email must be a valid email address") String email,
        @NotNull @Size(min = 4, message = "Password must be at least 4 characters long") String password,
        String photo,
        String name,
        String lastname,
        String gender,
        LocalDate birthDate,
        String role)
        implements UserCredentials {
    public User asUser(Function<String, String> encryptPassword) {
        return new User(
                name != null ? name : "User",
                encryptPassword.apply(password),
                gender != null ? gender : "Other",
                email,
                lastname != null ? lastname : "",
                photo != null ? photo : "",
                role != null ? role : "USER",
                birthDate != null ? birthDate : LocalDate.of(2000, 1, 1));
    }
}