package com.planazo.report;

import com.planazo.common.constants.ReportReason;
import com.planazo.user.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity(name = "reports")
public class Report {

    @Id
    @GeneratedValue
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportReason reason;

    @Column
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_user_id")
    private User reportedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id")
    private com.planazo.plan.Plan plan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "turistic_place_id")
    private com.planazo.turistic_place.TuristicPlace turisticPlace;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved", nullable = false)
    private Boolean resolved = false;

    public Report() {
        this.createdAt = LocalDateTime.now();
    }

    public Report(ReportReason reason, String description, User reporter, User reportedUser, 
                  com.planazo.plan.Plan plan, com.planazo.turistic_place.TuristicPlace turisticPlace) {
        this();
        this.reason = reason;
        this.description = description;
        this.reporter = reporter;
        this.reportedUser = reportedUser;
        this.plan = plan;
        this.turisticPlace = turisticPlace;
    }

    public Long getId() { return id; }
    public ReportReason getReason() { return reason; }
    public void setReason(ReportReason reason) { this.reason = reason; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }
    public User getReportedUser() { return reportedUser; }
    public void setReportedUser(User reportedUser) { this.reportedUser = reportedUser; }
    public com.planazo.plan.Plan getPlan() { return plan; }
    public void setPlan(com.planazo.plan.Plan plan) { this.plan = plan; }
    public com.planazo.turistic_place.TuristicPlace getTuristicPlace() { return turisticPlace; }
    public void setTuristicPlace(com.planazo.turistic_place.TuristicPlace turisticPlace) { this.turisticPlace = turisticPlace; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getResolved() { return resolved; }
    public void setResolved(Boolean resolved) { this.resolved = resolved; }
}
