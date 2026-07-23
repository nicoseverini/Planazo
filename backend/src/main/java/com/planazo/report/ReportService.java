package com.planazo.report;

import com.planazo.plan.Plan;
import com.planazo.plan.PlanRepository;
import com.planazo.report.dto.CreateReportRequest;
import com.planazo.report.dto.ReportResponse;
import com.planazo.tourist_place.TouristPlace;
import com.planazo.tourist_place.TouristPlaceRepository;
import com.planazo.user.User;
import com.planazo.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final TouristPlaceRepository touristPlaceRepository;

    public ReportService(ReportRepository reportRepository, UserRepository userRepository,
                         PlanRepository planRepository, TouristPlaceRepository touristPlaceRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.touristPlaceRepository = touristPlaceRepository;
    }

    @Transactional
    public ReportResponse createReport(CreateReportRequest request, Long reporterId) {
        User reporter = userRepository.findById(reporterId)
            .orElseThrow(() -> new RuntimeException("Reporter not found"));

        Plan plan = null;
        if (request.planId() != null) {
            plan = planRepository.findById(request.planId())
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        }

        TouristPlace touristPlace = null;
        if (request.touristPlaceId() != null) {
            touristPlace = touristPlaceRepository.findById(request.touristPlaceId())
                .orElseThrow(() -> new RuntimeException("Tourist place not found"));
        }

        User reportedUser = null;
        if (request.reportedUserId() != null) {
            reportedUser = userRepository.findById(request.reportedUserId())
                .orElseThrow(() -> new RuntimeException("Reported user not found"));
        }

        Report report = new Report(
            request.reason(),
            request.description(),
            reporter,
            reportedUser,
            plan,
            touristPlace
        );

        Report savedReport = reportRepository.save(report);
        return mapToResponse(savedReport);
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAll().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getUnresolvedReports() {
        return reportRepository.findByResolvedFalse().stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public void resolveReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new RuntimeException("Report not found"));
        report.setResolved(true);
        reportRepository.save(report);
    }

    private ReportResponse mapToResponse(Report report) {
        return new ReportResponse(
            report.getId(),
            report.getReason(),
            report.getDescription(),
            report.getReporter() != null ? report.getReporter().getId() : null,
            report.getReporter() != null ? report.getReporter().getName() : null,
            report.getReportedUser() != null ? report.getReportedUser().getId() : null,
            report.getReportedUser() != null ? report.getReportedUser().getName() : null,
            report.getPlan() != null ? report.getPlan().getId() : null,
            report.getPlan() != null ? report.getPlan().getTitle() : null,
            report.getTouristPlace() != null ? report.getTouristPlace().getId() : null,
            report.getTouristPlace() != null ? report.getTouristPlace().getName() : null,
            report.getCreatedAt(),
            report.getResolved()
        );
    }
}
