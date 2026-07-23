package com.planazo.plan;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Component
class PlanScheduler {

    private final PlanRepository planRepository;

    PlanScheduler(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Scheduled(fixedRate = 60_000) // time in milliseconds (ex: 60_000 ms = 60s = 1 minute)
    @Transactional
    public void deactivateExpiredPlans() {
        planRepository.deactivateExpiredPlans(LocalDateTime.now(ZoneOffset.UTC));
    }
}
