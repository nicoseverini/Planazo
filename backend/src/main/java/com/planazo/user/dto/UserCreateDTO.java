package com.planazo.user.dto;

import com.planazo.common.constants.Interest;
import com.planazo.common.constants.TravelType;
import com.planazo.user.User;
import com.planazo.user.UserCredentials;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;
import java.util.function.Function;

public record UserCreateDTO(
        @NotBlank @Email(message = "Email must be a valid email address") String email,
        @NotBlank
        @Size(min = 8, message = "Password must be at least 8 characters long")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
                message = "Password must include upper, lower, and number"
        )
        String password,
        String photo,
        String name,
        String lastname,
        String gender,
        LocalDate birthDate,
        List<Interest> interests,
        @Min(value = 0, message = "Budget must be zero or greater") Integer budget,
        TravelType travelType,
        List<String> languages,
        boolean receiveConfirmationEmail,
        String role)
        implements UserCredentials {
    public User asUser(Function<String, String> encryptPassword) {
        String resolvedName = name != null && !name.isBlank() ? name.trim() : "User";
        String resolvedPhoto = photo != null && !photo.isBlank()
                ? photo
                : defaultPhotoForName(resolvedName);
        return new User(
                resolvedName,
                encryptPassword.apply(password),
                gender != null ? gender : "Other",
                email,
                lastname != null ? lastname : "",
                resolvedPhoto,
                role != null ? role : "USER",
                birthDate != null ? birthDate : LocalDate.of(2000, 1, 1),
                interests != null ? List.copyOf(interests) : List.of(),
                budget,
                travelType,
                languages != null ? List.copyOf(languages) : List.of());
    }

    private static String defaultPhotoForName(String resolvedName) {
        if (resolvedName == null || resolvedName.isBlank()) {
            return "U";
        }
        return String.valueOf(Character.toUpperCase(resolvedName.trim().charAt(0)));
    }
}