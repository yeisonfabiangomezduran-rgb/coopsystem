package com.coopsystem.modules.report.dto;

import java.math.BigDecimal;

public class DashboardReportResponse {

    private final long totalAssociates;
    private final long activeSavingsAccounts;
    private final long activeLoans;
    private final long totalTransactions;
    private final BigDecimal treasuryBalance;
    private final long totalLoans;
    private final BigDecimal disbursedAmount;
    private final BigDecimal outstandingPrincipal;

    public DashboardReportResponse(
            long totalAssociates,
            long activeSavingsAccounts,
            long activeLoans,
            long totalTransactions,
            BigDecimal treasuryBalance,
            long totalLoans,
            BigDecimal disbursedAmount,
            BigDecimal outstandingPrincipal) {

        this.totalAssociates = totalAssociates;
        this.activeSavingsAccounts = activeSavingsAccounts;
        this.activeLoans = activeLoans;
        this.totalTransactions = totalTransactions;
        this.treasuryBalance = treasuryBalance;
        this.totalLoans = totalLoans;
        this.disbursedAmount = disbursedAmount;
        this.outstandingPrincipal = outstandingPrincipal;
    }

    public long getTotalAssociates() {
        return totalAssociates;
    }

    public long getActiveSavingsAccounts() {
        return activeSavingsAccounts;
    }

    public long getActiveLoans() {
        return activeLoans;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public BigDecimal getTreasuryBalance() {
        return treasuryBalance;
    }

    public long getTotalLoans() {
        return totalLoans;
    }

    public BigDecimal getDisbursedAmount() {
        return disbursedAmount;
    }

    public BigDecimal getOutstandingPrincipal() {
        return outstandingPrincipal;
    }
}
