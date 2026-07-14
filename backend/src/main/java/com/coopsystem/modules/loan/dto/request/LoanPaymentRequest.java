package com.coopsystem.modules.loan.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class LoanPaymentRequest {

    @NotNull(message = "El valor del pago es obligatorio")
    @DecimalMin(
            value = "0.01",
            message = "El valor del pago debe ser mayor que cero")
    private BigDecimal amount;

    public LoanPaymentRequest() {
    }

    public LoanPaymentRequest(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}