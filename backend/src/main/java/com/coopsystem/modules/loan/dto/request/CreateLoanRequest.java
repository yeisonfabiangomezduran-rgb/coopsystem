package com.coopsystem.modules.loan.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class CreateLoanRequest {

    @NotNull(message = "El asociado es obligatorio")
    private Long associateId;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(
            value = "1.00",
            message = "El monto debe ser mayor que cero"
    )
    private BigDecimal amount;

    @NotNull(message = "La tasa de interés es obligatoria")
    @DecimalMin(
            value = "0.01",
            message = "La tasa debe ser mayor que cero"
    )
    private BigDecimal interestRate;

    @NotNull(message = "El plazo es obligatorio")
    @Positive(message = "El plazo debe ser mayor que cero")
    private Integer termMonths;

    public CreateLoanRequest() {
    }

    public Long getAssociateId() {
        return associateId;
    }

    public void setAssociateId(Long associateId) {
        this.associateId = associateId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(BigDecimal interestRate) {
        this.interestRate = interestRate;
    }

    public Integer getTermMonths() {
        return termMonths;
    }

    public void setTermMonths(Integer termMonths) {
        this.termMonths = termMonths;
    }
}