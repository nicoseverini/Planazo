package com.planazo.tourist_place;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface TouristPlaceRepository extends JpaRepository<TouristPlace, Long> {

    @EntityGraph(attributePaths = "images")
    List<TouristPlace> findAllByOrderByNameAsc();

    @EntityGraph(attributePaths = "images")
    List<TouristPlace> findAllByCreatorIdOrderByNameAsc(Long creatorId);

    @EntityGraph(attributePaths = "images")
    @Query("SELECT tp FROM TouristPlace tp WHERE tp.creator.id = :creatorId")
    List<TouristPlace> findAllByCreatorId(@Param("creatorId") Long creatorId);

    @Transactional
    @Modifying
    @Query("DELETE FROM TouristPlace tp WHERE tp.creator.id = :creatorId")
    void deleteByCreatorId(Long creatorId);
}