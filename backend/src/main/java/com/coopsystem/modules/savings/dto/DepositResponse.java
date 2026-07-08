package com.coopsystem.modules.savings.dto;

import java.math.BigDecimal;

public class DepositResponse {

    private String accountNumber;
    private BigDecimal previousBalance;
    private BigDecimal depositAmount;
    private BigDecimal currentBalance;

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