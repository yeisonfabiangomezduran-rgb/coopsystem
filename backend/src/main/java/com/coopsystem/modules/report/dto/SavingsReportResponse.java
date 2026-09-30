package com.coopsystem.modules.report.dto;

import java.math.BigDecimal;

public record SavingsReportResponse(
        String account,
        String associateName,
        BigDecimal balance,
        String status,
        String openedAt
) {
}