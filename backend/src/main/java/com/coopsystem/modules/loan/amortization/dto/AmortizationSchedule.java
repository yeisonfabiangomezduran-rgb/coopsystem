package com.coopsystem.modules.loan.amortization.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Resultado completo de un proceso de amortización.
 */
public class AmortizationSchedule {

    /**
     * Valor fijo de la cuota mensual.
     */
    private BigDecimal monthlyPayment;

    /**
     * Total de intereses pagados durante el préstamo.
     */
    private BigDecimal totalInterest;

    /**
     * Valor total pagado (capital + intereses).
     */
    private BigDecimal totalAmount;

    /**
     * Cronograma de cuotas.
     */
    private List<InstallmentCalculation> installments =
            new ArrayList<>();

    public AmortizationSchedule() {
    }

    public BigDecimal getMonthlyPayment() {
        return monthlyPayment;
    }

    public void setMonthlyPayment(BigDecimal monthlyPayment) {
        this.monthlyPayment = monthlyPayment;
    }

    public BigDecimal getTotalInterest() {
        return totalInterest;
    }

    public void setTotalInterest(BigDecimal totalInterest) {
        this.totalInterest = totalInterest;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<InstallmentCalculation> getInstallments() {
        return installments;
    }

    public void setInstallments(
            List<InstallmentCalculation> installments) {

        this.installments = installments;
    }
}