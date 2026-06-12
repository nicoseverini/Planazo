package com.planazo.plan;

import com.planazo.common.constants.Interest;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PlanSpecification {

    public static Specification<Plan> withFilters(
            Interest interest,
            LocalDateTime dateFrom,
            LocalDateTime dateTo,
            String location,
            Double maxPriceOrScore,
            Double userLat,
            Double userLng,
            Double radiusKm
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("visibility"), PlanVisibility.PUBLIC));
            predicates.add(cb.isTrue(root.get("active")));

            if (interest != null) {
                predicates.add(cb.isMember(interest, root.get("interests")));
            }

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("startDateTime"), dateFrom));
            }

            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("startDateTime"), dateTo));
            }

            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(
                    cb.lower(root.get("location")),
                    "%" + location.toLowerCase() + "%"
                ));
            }

            if (userLat != null && userLng != null && radiusKm != null) {
                double deltaLat = radiusKm / 111.0;
                double deltaLng = radiusKm / (111.0 * Math.cos(Math.toRadians(userLat)));

                predicates.add(cb.between(root.get("latitude"), userLat - deltaLat, userLat + deltaLat));
                predicates.add(cb.between(root.get("longitude"), userLng - deltaLng, userLng + deltaLng));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
