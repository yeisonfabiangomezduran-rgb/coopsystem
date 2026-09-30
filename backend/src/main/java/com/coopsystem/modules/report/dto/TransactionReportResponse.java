package com.coopsystem.modules.report.dto;

import java.math.BigDecimal;

public record TransactionReportResponse(
        String number,
        String type,
        String date,
        BigDecimal amount,
        String user
) {
}
