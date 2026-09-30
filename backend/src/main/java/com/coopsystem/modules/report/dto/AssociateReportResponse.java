package com.coopsystem.modules.report.dto;

public record AssociateReportResponse(
        String code,
        String name,
        String document,
        String status,
        String entryDate
) {
}