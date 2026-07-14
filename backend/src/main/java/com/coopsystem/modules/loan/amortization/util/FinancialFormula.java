package com.coopsystem.modules.loan.amortization.util;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;

/**
 * Utilidades para cálculos financieros.
 */
public final class FinancialFormula {

    /**
     * Precisión utilizada en todos los cálculos.
     */
    private static final MathContext MC =
            new MathContext(15, RoundingMode.HALF_UP);

    /**
     * Escala para valores monetarios.
     */
    private static final int SCALE = 2;

    private FinancialFormula() {
        // Evita instanciación
    }

    /**
     * Calcula la cuota fija usando el Sistema Francés.
     *
     * Fórmula:
     *
     * C = P * [ i(1+i)^n ] / [ (1+i)^n - 1 ]
     *
     * @param amount monto del préstamo
     * @param monthlyRate tasa mensual en porcentaje
     * @param months plazo del préstamo
     * @return valor de la cuota mensual
     */
    public static BigDecimal calculateMonthlyPayment(
            BigDecimal amount,
            BigDecimal monthlyRate,
            Integer months) {

        BigDecimal rate = monthlyRate
                .divide(BigDecimal.valueOf(100), MC);

        double factor = Math.pow(
                BigDecimal.ONE.add(rate).doubleValue(),
                months
        );

        BigDecimal numerator = amount
                .multiply(rate, MC)
                .multiply(BigDecimal.valueOf(factor), MC);

        BigDecimal denominator =
                BigDecimal.valueOf(factor)
                        .subtract(BigDecimal.ONE);

        return numerator
                .divide(denominator, SCALE, RoundingMode.HALF_UP);
    }

    /**
     * Calcula el interés de una cuota.
     */
    public static BigDecimal calculateInterest(
            BigDecimal balance,
            BigDecimal monthlyRate) {

        BigDecimal rate = monthlyRate
                .divide(BigDecimal.valueOf(100), MC);

        return balance
                .multiply(rate, MC)
                .setScale(SCALE, RoundingMode.HALF_UP);
    }

    /**
     * Calcula el abono a capital.
     */
    public static BigDecimal calculatePrincipal(
            BigDecimal payment,
            BigDecimal interest) {

        return payment
                .subtract(interest)
                .setScale(SCALE, RoundingMode.HALF_UP);
    }

    /**
     * Calcula el saldo restante.
     */
    public static BigDecimal calculateRemainingBalance(
            BigDecimal balance,
            BigDecimal principal) {

        return balance
                .subtract(principal)
                .max(BigDecimal.ZERO)
                .setScale(SCALE, RoundingMode.HALF_UP);
    }

}