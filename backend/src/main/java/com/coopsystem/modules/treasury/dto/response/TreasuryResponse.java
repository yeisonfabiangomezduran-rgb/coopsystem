package com.coopsystem.modules.treasury.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TreasuryResponse {

    private final Long id;
    private final String name;
    private final BigDecimal balance;
    private final LocalDateTime createdAt;

    public TreasuryResponse(
            Long id,
            String name,
            BigDecimal balance,
            LocalDateTime createdAt) {

        this.id = id;
        this.name = name;
        this.balance = balance;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}