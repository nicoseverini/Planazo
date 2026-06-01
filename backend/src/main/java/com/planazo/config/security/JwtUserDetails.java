package com.planazo.config.security;

public record JwtUserDetails (
        String username,
        String role,
        Long id
) {}