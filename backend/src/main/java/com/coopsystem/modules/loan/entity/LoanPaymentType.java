package com.coopsystem.modules.loan.entity;

/**
 * Tipos de pago disponibles para un préstamo.
 */
public enum LoanPaymentType {

    /**
     * Pago normal de una cuota.
     */
    INSTALLMENT,

    /**
     * Abono extraordinario directamente al capital.
     */
    PRINCIPAL_ABATEMENT,

    /**
     * Pago del saldo total pendiente del préstamo.
     */
    FULL_PAYMENT
}