package com.planazo.report.dto;

import com.planazo.common.constants.ReportReason;

import java.time.LocalDateTime;

public record ReportResponse(
    Long id,
    ReportReason reason,
    String description,
    Long reporterId,
    String reporterName,
    Long reportedUserId,
    String reportedUserName,
    Long planId,
    String planTitle,
    Long turisticPlaceId,
    String turisticPlaceName,
    LocalDateTime createdAt,
    Boolean resolved
) {}
