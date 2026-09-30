package com.coopsystem.modules.loan.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class LoanResponse {

    private final Long id;
    private final String loanNumber;
    private final Long associateId;
    private final String associateName;
    private final String associateCode;
    private final BigDecimal amount;
    private final BigDecimal interestRate;
    private final Integer termMonths;
    private final String status;
    private final LocalDateTime requestedAt;
    private final LocalDateTime approvedAt;

    public LoanResponse(
            Long id,
            String loanNumber,
            Long associateId,
            String associateName,
            String associateCode,
            BigDecimal amount,
            BigDecimal interestRate,
            Integer termMonths,
            String status,
            LocalDateTime requestedAt,
            LocalDateTime approvedAt) {

        this.id = id;
        this.loanNumber = loanNumber;
        this.associateId = associateId;
        this.associateName = associateName;
        this.associateCode = associateCode;
        this.amount = amount;
        this.interestRate = interestRate;
        this.termMonths = termMonths;
        this.status = status;
        this.requestedAt = requestedAt;
        this.approvedAt = approvedAt;
    }

    public LoanResponse(
        Long id,
        String loanNumber,
        Long associateId,
        BigDecimal amount,
        BigDecimal interestRate,
        Integer termMonths,
        String status,
        LocalDateTime requestedAt,
        LocalDateTime approvedAt) {

    this(
        id,
        loanNumber,
        associateId,
        null,
        null,
        amount,
        interestRate,
        termMonths,
        status,
        requestedAt,
        approvedAt
    );
}

    public Long getId() {
        return id;
    }

    public String getLoanNumber() {
        return loanNumber;
    }

    public Long getAssociateId() {
        return associateId;
    }

    public String getAssociateName() {
        return associateName;
    }

    public String getAssociateCode() {
        return associateCode;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public BigDecimal getInterestRate() {
        return interestRate;
    }

    public Integer getTermMonths() {
        return termMonths;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public LocalDateTime getApprovedAt() {
        return approvedAt;
    }
}
