package com.planazo.report;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByResolvedFalse();
    List<Report> findByPlanId(Long planId);
    List<Report> findByTuristicPlaceId(Long turisticPlaceId);
    List<Report> findByReportedUserId(Long reportedUserId);
    void deleteByPlanId(Long planId);
    void deleteByTuristicPlaceId(Long turisticPlaceId);
}
