package com.planazo.plan;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.planazo.common.constants.Interest;
import com.planazo.common.constants.TravelType;

import java.util.List;

public interface PlanRepository extends JpaRepository<Plan, Long>, JpaSpecificationExecutor<Plan> {

    // All public active plans
    @EntityGraph(attributePaths = "images")
    List<Plan> findByVisibilityAndActiveTrue(PlanVisibility visibility);

    // Plans created by a user (only active)
    @EntityGraph(attributePaths = "images")
    List<Plan> findByCreatorIdAndActiveTrue(Long creatorId);

    // All plans created by a user (regardless of active status)
    @EntityGraph(attributePaths = "images")
    List<Plan> findByCreatorId(Long creatorId);

    // All active plans, regardless of visibility
    @EntityGraph(attributePaths = "images")
    Page<Plan> findByActiveTrue(Pageable pageable);

    @EntityGraph(attributePaths = "images")
    List<Plan> findByActiveTrue();

    // Plans where a user is subscribed
    @EntityGraph(attributePaths = "images")
        @Query("SELECT p FROM plans p JOIN p.subscribers s WHERE s.user.id = :userId AND p.active = true")
    List<Plan> findBySubscriberId(@Param("userId") Long userId);
        // Plans where a user is subscribed and is not the creator
    @EntityGraph(attributePaths = "images")
        @Query("SELECT p FROM plans p JOIN p.subscribers s WHERE s.user.id = :userId AND p.active = true AND p.creator.id != :userId")
    List<Plan> findBySubscriberIdAndNotCreatorId(@Param("userId") Long userId);
    // Filter by interest
    @EntityGraph(attributePaths = "images")
    List<Plan> findByVisibilityAndInterestsContainingAndActiveTrue(PlanVisibility visibility, Interest interest);

    // Filter by travelType
    @EntityGraph(attributePaths = "images")
    List<Plan> findByVisibilityAndTravelTypeAndActiveTrue(PlanVisibility visibility, TravelType travelType);

    @Query(value = "SELECT p.* FROM plans p " +
            "WHERE p.visibility = 'PUBLIC' AND p.active = true AND " +
            "(6371 * acos(cos(radians(:userLat)) * cos(radians(p.latitude)) " +
            "* cos(radians(p.longitude) - radians(:userLng)) + sin(radians(:userLat)) " +
            "* sin(radians(p.latitude)))) <= :radiusKm " +
            "ORDER BY (6371 * acos(cos(radians(:userLat)) * cos(radians(p.latitude)) " +
            "* cos(radians(p.longitude) - radians(:userLng)) + sin(radians(:userLat)) " +
            "* sin(radians(p.latitude)))) ASC",
            nativeQuery = true)
    List<Plan> findNearbyPublicActivePlans(@Param("userLat") double userLat,
                                           @Param("userLng") double userLng,
                                           @Param("radiusKm") double radiusKm);
}