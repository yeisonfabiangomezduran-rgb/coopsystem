package com.coopsystem.modules.loan.amortization.strategy;

import com.coopsystem.modules.loan.entity.Loan;
import com.coopsystem.modules.loan.entity.LoanInstallment;
import org.springframework.stereotype.Component;

import java.math.MathContext;
import java.math.RoundingMode;
import java.util.List;

/**
 * Implementación del Sistema Francés (cuota fija).
 */
@Component
public class FrenchAmortizationStrategy implements AmortizationStrategy {

    /**
     * Precisión utilizada en todos los cálculos financieros.
     */
    private static final MathContext MATH_CONTEXT =
            new MathContext(15, RoundingMode.HALF_UP);

    /**
     * Escala utilizada para valores monetarios.
     */
    private static final int SCALE = 2;

    @Override
    public List<LoanInstallment> generateSchedule(Loan loan) {

        // Aquí construiremos el algoritmo completo.

        throw new UnsupportedOperationException(
                "Generación de cronograma aún no implementada");
    }

}