package com.planazo.review.dto;

import com.planazo.review.ReviewTarget;
import java.time.Instant;

public record ReviewResponseDto(
    Long id,
    Integer rating,
    String comment,
    ReviewTarget targetType,
    Long targetId,
    Instant createdAt,
    ReviewAuthorDto author
) {}
