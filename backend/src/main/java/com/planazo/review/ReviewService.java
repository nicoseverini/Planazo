package com.planazo.review;

import com.planazo.review.dto.ReviewAuthorDto;
import com.planazo.review.dto.ReviewRequestDto;
import com.planazo.review.dto.ReviewResponseDto;
import com.planazo.review.dto.ReviewStatsDto;
import com.planazo.user.User;
import com.planazo.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserService userService;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, UserService userService) {
        this.reviewRepository = reviewRepository;
        this.userService = userService;
    }

    public List<ReviewResponseDto> getReviews(ReviewTarget targetType, Long targetId) {
        return reviewRepository.findByTargetTypeAndTargetIdOrderByCreatedAtDesc(targetType, targetId)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    public ReviewStatsDto getReviewStats(ReviewTarget targetType, Long targetId) {
        Double average = reviewRepository.getAverageRatingByTarget(targetType, targetId);
        Long count = reviewRepository.getReviewCountByTarget(targetType, targetId);
        return new ReviewStatsDto(average, count);
    }

    @Transactional
    public ReviewResponseDto createReview(ReviewRequestDto dto, ReviewTarget targetType, Long targetId, String userEmail) {
        User user = userService.getUserByEmail(userEmail);

        if (targetType == ReviewTarget.USER) {
            if (user.getId().equals(targetId)) {
                throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "You cannot review yourself.");
            }
            if (!userService.existsById(targetId)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
            }
        }

        java.util.Optional<Review> existingReviewOpt = reviewRepository.findByUserIdAndTargetTypeAndTargetId(user.getId(), targetType, targetId);
        
        Review review;
        if (existingReviewOpt.isPresent()) {
            review = existingReviewOpt.get();
            review.setRating(dto.rating());
            review.setComment(dto.comment());
            review.setCreatedAt(java.time.Instant.now());
        } else {
            review = new Review(user, dto.rating(), dto.comment(), targetType, targetId);
        }
        
        Review saved = reviewRepository.save(review);
        return mapToResponseDto(saved);
    }

    @Transactional
    public void deleteReview(ReviewTarget targetType, Long targetId, String userEmail) {
        User user = userService.getUserByEmail(userEmail);
        Review review = reviewRepository.findByUserIdAndTargetTypeAndTargetId(user.getId(), targetType, targetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
        reviewRepository.delete(review);
    }

    public List<ReviewResponseDto> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private ReviewResponseDto mapToResponseDto(Review review) {
        User author = review.getUser();
        ReviewAuthorDto authorDto = new ReviewAuthorDto(
                author.getId(),
                author.getName(),
                author.getLastname(),
                author.getPhoto()
        );
        return new ReviewResponseDto(
                review.getId(),
                review.getRating(),
                review.getComment(),
                review.getTargetType(),
                review.getTargetId(),
                review.getCreatedAt(),
                authorDto
        );
    }
}
