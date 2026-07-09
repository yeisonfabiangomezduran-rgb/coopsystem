package com.coopsystem.modules.transaction.dto;

import java.math.BigDecimal;

public class WithdrawResponse {

    private final String accountNumber;
    private final BigDecimal previousBalance;
    private final BigDecimal withdrawAmount;
    private final BigDecimal currentBalance;

    public WithdrawResponse(
            String accountNumber,
            BigDecimal previousBalance,
            BigDecimal withdrawAmount,
            BigDecimal currentBalance) {

        this.accountNumber = accountNumber;
        this.previousBalance = previousBalance;
        this.withdrawAmount = withdrawAmount;
        this.currentBalance = currentBalance;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public BigDecimal getPreviousBalance() {
        return previousBalance;
    }

    public BigDecimal getWithdrawAmount() {
        return withdrawAmount;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }
}