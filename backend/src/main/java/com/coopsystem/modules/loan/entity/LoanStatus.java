package com.coopsystem.modules.loan.entity;

/**
 * Estados posibles de un préstamo durante su ciclo de vida.
 */
public enum LoanStatus {

    PENDING,
    APPROVED,
    REJECTED,
    DISBURSED,
    PAID,
    CANCELLED

}