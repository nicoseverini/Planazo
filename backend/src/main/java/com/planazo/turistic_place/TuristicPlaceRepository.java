package com.planazo.turistic_place;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface TuristicPlaceRepository extends JpaRepository<TuristicPlace, Long> {

    @EntityGraph(attributePaths = "images")
    List<TuristicPlace> findAllByOrderByNameAsc();

    @EntityGraph(attributePaths = "images")
    List<TuristicPlace> findAllByCreatorIdOrderByNameAsc(Long creatorId);

    @EntityGraph(attributePaths = "images")
    @Query("SELECT tp FROM TuristicPlace tp WHERE tp.creator.id = :creatorId")
    List<TuristicPlace> findAllByCreatorId(@Param("creatorId") Long creatorId);

    @Transactional
    @Modifying
    @Query("DELETE FROM TuristicPlace tp WHERE tp.creator.id = :creatorId")
    void deleteByCreatorId(Long creatorId);
}