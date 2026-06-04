package com.planazo.turistic_place;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TuristicPlaceRepository extends JpaRepository<TuristicPlace, Long> {

    @EntityGraph(attributePaths = "images")
    List<TuristicPlace> findAllByOrderByNameAsc();

    @EntityGraph(attributePaths = "images")
    List<TuristicPlace> findAllByCreatorIdOrderByNameAsc(Long creatorId);
}