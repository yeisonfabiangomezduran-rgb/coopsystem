package com.coopsystem.modules.savings.dto;

import java.math.BigDecimal;

public class WithdrawResponse {

    private String accountNumber;
    private BigDecimal previousBalance;
    private BigDecimal withdrawAmount;
    private BigDecimal currentBalance;

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