package com.planazo.report.dto;

import com.planazo.common.constants.ReportReason;

public record CreateReportRequest(
    ReportReason reason,
    String description,
    Long planId,
    Long touristPlaceId,
    Long reportedUserId
) {}
