package com.planazo.user.dto;

import jakarta.validation.constraints.Size;

public record UserAdminDeleteDTO(
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    String reason
) {}
