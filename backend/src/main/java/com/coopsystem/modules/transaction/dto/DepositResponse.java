package com.coopsystem.modules.transaction.dto;

import java.math.BigDecimal;

public class DepositResponse {

    private final String accountNumber;
    private final BigDecimal previousBalance;
    private final BigDecimal depositAmount;
    private final BigDecimal currentBalance;

    public DepositResponse(
            String accountNumber,
            BigDecimal previousBalance,
            BigDecimal depositAmount,
            BigDecimal currentBalance) {

        this.accountNumber = accountNumber;
        this.previousBalance = previousBalance;
        this.depositAmount = depositAmount;
        this.currentBalance = currentBalance;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public BigDecimal getPreviousBalance() {
        return previousBalance;
    }

    public BigDecimal getDepositAmount() {
        return depositAmount;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }
}