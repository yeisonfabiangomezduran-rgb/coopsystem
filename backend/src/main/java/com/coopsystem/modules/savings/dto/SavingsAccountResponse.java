package com.coopsystem.modules.savings.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SavingsAccountResponse {

    private Long id;

    private String accountNumber;

    private BigDecimal balance;

    private String status;

    private LocalDateTime openedAt;

    private Long associateId;

    public SavingsAccountResponse(
            Long id,
            String accountNumber,
            BigDecimal balance,
            String status,
            LocalDateTime openedAt,
            Long associateId) {

        this.id = id;
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.status = status;
        this.openedAt = openedAt;
        this.associateId = associateId;
    }

    public Long getId() {
        return id;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getOpenedAt() {
        return openedAt;
    }

    public Long getAssociateId() {
        return associateId;
    }
}