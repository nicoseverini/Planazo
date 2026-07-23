package com.planazo.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(ReviewTarget targetType, Long targetId);

    java.util.Optional<Review> findByUserIdAndTargetTypeAndTargetId(Long userId, ReviewTarget targetType, Long targetId);

    // Used by the demo-data seeder to top reviews up to the target totals.
    long countByTargetType(ReviewTarget targetType);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.targetType = :type AND r.targetId = :id")
    Double getAverageRatingByTarget(@Param("type") ReviewTarget targetType, @Param("id") Long targetId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.targetType = :type AND r.targetId = :id")
    Long getReviewCountByTarget(@Param("type") ReviewTarget targetType, @Param("id") Long targetId);

    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByUserId(Long userId);
}
