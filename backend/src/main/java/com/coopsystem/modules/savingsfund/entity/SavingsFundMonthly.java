package com.coopsystem.modules.savingsfund.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "savings_fund_monthly",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_savings_fund_month",
                        columnNames = {"year", "month"}
                )
        }
)
public class SavingsFundMonthly {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "month", nullable = false)
    private Integer month;

    @Column(
            name = "total_savings_deposits",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal totalSavingsDeposits = BigDecimal.ZERO;

    @Column(
            name = "previous_month_balance",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal previousMonthBalance = BigDecimal.ZERO;

    @Column(
            name = "loan_percentage",
            nullable = false,
            precision = 5,
            scale = 2
    )
    private BigDecimal loanPercentage;

    @Column(
            name = "returns_percentage",
            nullable = false,
            precision = 5,
            scale = 2
    )
    private BigDecimal returnsPercentage;

    @Column(
            name = "loan_fund_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal loanFundAmount = BigDecimal.ZERO;

    @Column(
            name = "returns_reserve_amount",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal returnsReserveAmount = BigDecimal.ZERO;

    @Column(
            name = "loan_disbursements",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal loanDisbursements = BigDecimal.ZERO;

    @Column(
            name = "loan_fund_available",
            nullable = false,
            precision = 19,
            scale = 2
    )
    private BigDecimal loanFundAvailable = BigDecimal.ZERO;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "OPEN";

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public BigDecimal getTotalSavingsDeposits() {
        return totalSavingsDeposits;
    }

    public void setTotalSavingsDeposits(
            BigDecimal totalSavingsDeposits) {
        this.totalSavingsDeposits = totalSavingsDeposits;
    }

    public BigDecimal getPreviousMonthBalance() {
        return previousMonthBalance;
    }

    public void setPreviousMonthBalance(
            BigDecimal previousMonthBalance) {
        this.previousMonthBalance = previousMonthBalance;
    }

    public BigDecimal getLoanPercentage() {
        return loanPercentage;
    }

    public void setLoanPercentage(
            BigDecimal loanPercentage) {
        this.loanPercentage = loanPercentage;
    }

    public BigDecimal getReturnsPercentage() {
        return returnsPercentage;
    }

    public void setReturnsPercentage(
            BigDecimal returnsPercentage) {
        this.returnsPercentage = returnsPercentage;
    }

    public BigDecimal getLoanFundAmount() {
        return loanFundAmount;
    }

    public void setLoanFundAmount(
            BigDecimal loanFundAmount) {
        this.loanFundAmount = loanFundAmount;
    }

    public BigDecimal getReturnsReserveAmount() {
        return returnsReserveAmount;
    }

    public void setReturnsReserveAmount(
            BigDecimal returnsReserveAmount) {
        this.returnsReserveAmount = returnsReserveAmount;
    }

    public BigDecimal getLoanDisbursements() {
        return loanDisbursements;
    }

    public void setLoanDisbursements(
            BigDecimal loanDisbursements) {
        this.loanDisbursements = loanDisbursements;
    }

    public BigDecimal getLoanFundAvailable() {
        return loanFundAvailable;
    }

    public void setLoanFundAvailable(
            BigDecimal loanFundAvailable) {
        this.loanFundAvailable = loanFundAvailable;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(LocalDateTime closedAt) {
        this.closedAt = closedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}