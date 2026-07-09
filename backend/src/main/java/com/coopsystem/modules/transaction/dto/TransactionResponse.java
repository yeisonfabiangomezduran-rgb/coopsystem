package com.coopsystem.modules.transaction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionResponse {

    private String transactionType;
    private BigDecimal amount;
    private BigDecimal previousBalance;
    private BigDecimal currentBalance;
    private LocalDateTime transactionDate;

    public TransactionResponse(
            String transactionType,
            BigDecimal amount,
            BigDecimal previousBalance,
            BigDecimal currentBalance,
            LocalDateTime transactionDate) {

        this.transactionType = transactionType;
        this.amount = amount;
        this.previousBalance = previousBalance;
        this.currentBalance = currentBalance;
        this.transactionDate = transactionDate;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getPreviousBalance() {
        return previousBalance;
    }

    public BigDecimal getCurrentBalance() {
        return currentBalance;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }
}