package com.coopsystem.modules.savingsfund.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SavingsFundMonthlyResponse(
        Long id,
        Integer year,
        Integer month,
        BigDecimal totalSavingsDeposits,
        BigDecimal previousMonthBalance,
        BigDecimal loanPercentage,
        BigDecimal returnsPercentage,
        BigDecimal loanFundAmount,
        BigDecimal returnsReserveAmount,
        BigDecimal loanDisbursements,
        BigDecimal loanFundAvailable,
        String status,
        LocalDateTime closedAt
) {
}