package com.coopsystem.modules.loan.dto.request;

import com.coopsystem.modules.loan.entity.LoanPaymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class LoanPaymentRequest {

    @NotNull(message = "El valor del pago es obligatorio")
    @DecimalMin(
            value = "0.01",
            message = "El valor del pago debe ser mayor que cero"
    )
    private BigDecimal amount;

    @NotNull(message = "El tipo de pago es obligatorio")
    private LoanPaymentType paymentType;

    public LoanPaymentRequest() {
    }

    /**
     * Constructor compatible con código y pruebas existentes.
     *
     * Por defecto se considera un pago normal de cuota.
     */
    public LoanPaymentRequest(BigDecimal amount) {
        this.amount = amount;
        this.paymentType = LoanPaymentType.INSTALLMENT;
    }

    public LoanPaymentRequest(
            BigDecimal amount,
            LoanPaymentType paymentType) {

        this.amount = amount;
        this.paymentType = paymentType;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LoanPaymentType getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(
            LoanPaymentType paymentType) {

        this.paymentType = paymentType;
    }
}