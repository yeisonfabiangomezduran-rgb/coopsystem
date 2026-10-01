package com.coopsystem.modules.report.dto;

import java.math.BigDecimal;

public record TreasuryReportResponse(
        String number,
        String type,
        String date,
        BigDecimal amount,
        String user,
        BigDecimal treasuryBalance
) {
}
