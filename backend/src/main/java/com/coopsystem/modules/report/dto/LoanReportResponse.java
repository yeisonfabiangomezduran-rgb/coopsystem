package com.coopsystem.modules.report.dto;

import java.math.BigDecimal;

public record LoanReportResponse(
        String loanNumber,
        String associateName,
        BigDecimal amount,
        BigDecimal outstandingBalance,
        BigDecimal interestRate,
        Integer termMonths,
        String status,
        String requestedAt,
        String approvedAt
) {
}