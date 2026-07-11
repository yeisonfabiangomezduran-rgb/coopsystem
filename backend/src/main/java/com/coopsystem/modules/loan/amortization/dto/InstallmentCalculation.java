package com.coopsystem.modules.loan.amortization.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Resultado del cálculo de una cuota del préstamo.
 * Este DTO no representa una entidad de base de datos.
 */
public class InstallmentCalculation {

    private Integer installmentNumber;

    private LocalDate dueDate;

    private BigDecimal principal;

    private BigDecimal interest;

    private BigDecimal totalPayment;

    private BigDecimal remainingBalance;

    public InstallmentCalculation() {
    }

    public InstallmentCalculation(
            Integer installmentNumber,
            LocalDate dueDate,
            BigDecimal principal,
            BigDecimal interest,
            BigDecimal totalPayment,
            BigDecimal remainingBalance) {

        this.installmentNumber = installmentNumber;
        this.dueDate = dueDate;
        this.principal = principal;
        this.interest = interest;
        this.totalPayment = totalPayment;
        this.remainingBalance = remainingBalance;
    }

    public Integer getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(Integer installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public BigDecimal getPrincipal() {
        return principal;
    }

    public void setPrincipal(BigDecimal principal) {
        this.principal = principal;
    }

    public BigDecimal getInterest() {
        return interest;
    }

    public void setInterest(BigDecimal interest) {
        this.interest = interest;
    }

    public BigDecimal getTotalPayment() {
        return totalPayment;
    }

    public void setTotalPayment(BigDecimal totalPayment) {
        this.totalPayment = totalPayment;
    }

    public BigDecimal getRemainingBalance() {
        return remainingBalance;
    }

    public void setRemainingBalance(BigDecimal remainingBalance) {
        this.remainingBalance = remainingBalance;
    }
}