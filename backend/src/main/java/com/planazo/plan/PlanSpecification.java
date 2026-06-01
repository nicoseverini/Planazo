package com.planazo.plan;

import com.planazo.common.constants.Interest;
import com.planazo.common.constants.TravelType;
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
            Double maxPriceOrScore,  // reservado para futuro
            Double userLat,
            Double userLng,
            Double radiusKm
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Siempre: solo planes públicos y activos
            predicates.add(cb.equal(root.get("visibility"), PlanVisibility.PUBLIC));
            predicates.add(cb.isTrue(root.get("active")));

            if (interest != null) {
                predicates.add(cb.equal(root.get("interest"), interest));
            }

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dateTime"), dateFrom));
            }

            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dateTime"), dateTo));
            }

            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(
                    cb.lower(root.get("location")),
                    "%" + location.toLowerCase() + "%"
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}