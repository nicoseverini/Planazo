package com.planazo.plan;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlanSubscriberRepository extends JpaRepository<PlanSubscriber, PlanSubscriberId> {

    @Query("SELECT ps FROM PlanSubscriber ps JOIN FETCH ps.plan WHERE ps.user.id = :userId")
    List<PlanSubscriber> findByUserIdWithPlan(@Param("userId") Long userId);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM PlanSubscriber ps WHERE ps.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
