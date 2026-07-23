package com.planazo.review;

import com.planazo.review.dto.ReviewRequestDto;
import com.planazo.review.dto.ReviewResponseDto;
import com.planazo.review.dto.ReviewStatsDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@Tag(name = "Reviews", description = "Endpoints for leaving and listing reviews & ratings")
public class ReviewRestController {

    private final ReviewService reviewService;

    @Autowired
    public ReviewRestController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping(value = "/{targetType}/{targetId}", produces = "application/json")
    @Operation(summary = "Get all reviews for a specific target")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ReviewResponseDto>> getReviews(
            @PathVariable ReviewTarget targetType,
            @PathVariable Long targetId) {
        return ResponseEntity.ok(reviewService.getReviews(targetType, targetId));
    }

    @GetMapping(value = "/{targetType}/{targetId}/stats", produces = "application/json")
    @Operation(summary = "Get review stats (average rating and count) for a specific target")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<ReviewStatsDto> getReviewStats(
            @PathVariable ReviewTarget targetType,
            @PathVariable Long targetId) {
        return ResponseEntity.ok(reviewService.getReviewStats(targetType, targetId));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping(value = "/{targetType}/{targetId}", produces = "application/json")
    @Operation(summary = "Submit a new review")
    @ApiResponse(responseCode = "201", description = "Review submitted successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
    @ApiResponse(responseCode = "400", description = "Bad Request (Validation failure)", content = @Content)
    public ResponseEntity<ReviewResponseDto> createReview(
            @PathVariable ReviewTarget targetType,
            @PathVariable Long targetId,
            @Valid @RequestBody ReviewRequestDto requestDto,
            @AuthenticationPrincipal(expression = "username") String email) {
        ReviewResponseDto response = reviewService.createReview(requestDto, targetType, targetId, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping(value = "/{targetType}/{targetId}")
    @Operation(summary = "Delete a review")
    @ApiResponse(responseCode = "204", description = "Review deleted successfully")
    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content)
    @ApiResponse(responseCode = "404", description = "Review not found", content = @Content)
    public ResponseEntity<Void> deleteReview(
            @PathVariable ReviewTarget targetType,
            @PathVariable Long targetId,
            @AuthenticationPrincipal(expression = "username") String email) {
        reviewService.deleteReview(targetType, targetId, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/user/{userId}", produces = "application/json")
    @Operation(summary = "Get all reviews by a user")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByUser(
            @PathVariable Long userId) {
        return ResponseEntity.ok(reviewService.getReviewsByUser(userId));
    }
}
