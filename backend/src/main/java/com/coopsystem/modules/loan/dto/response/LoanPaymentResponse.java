package com.coopsystem.modules.loan.dto.response;

import java.math.BigDecimal;

public class LoanPaymentResponse {

    private String loanNumber;

    private Integer installmentNumber;

    private BigDecimal amountPaid;

    private Integer remainingInstallments;

    private String loanStatus;

    public LoanPaymentResponse() {
    }

    public LoanPaymentResponse(
            String loanNumber,
            Integer installmentNumber,
            BigDecimal amountPaid,
            Integer remainingInstallments,
            String loanStatus) {

        this.loanNumber = loanNumber;
        this.installmentNumber = installmentNumber;
        this.amountPaid = amountPaid;
        this.remainingInstallments = remainingInstallments;
        this.loanStatus = loanStatus;
    }

    public String getLoanNumber() {
        return loanNumber;
    }

    public void setLoanNumber(String loanNumber) {
        this.loanNumber = loanNumber;
    }

    public Integer getInstallmentNumber() {
        return installmentNumber;
    }

    public void setInstallmentNumber(Integer installmentNumber) {
        this.installmentNumber = installmentNumber;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public Integer getRemainingInstallments() {
        return remainingInstallments;
    }

    public void setRemainingInstallments(Integer remainingInstallments) {
        this.remainingInstallments = remainingInstallments;
    }

    public String getLoanStatus() {
        return loanStatus;
    }

    public void setLoanStatus(String loanStatus) {
        this.loanStatus = loanStatus;
    }
}