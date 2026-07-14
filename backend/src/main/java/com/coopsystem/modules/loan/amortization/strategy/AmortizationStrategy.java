package com.coopsystem.modules.loan.amortization.strategy;

import com.coopsystem.modules.loan.amortization.dto.AmortizationSchedule;
import com.coopsystem.modules.loan.entity.Loan;

/**
 * Define el contrato para los diferentes sistemas de amortización.
 */
public interface AmortizationStrategy {

    /**
     * Genera el cronograma de amortización.
     */
    AmortizationSchedule generateSchedule(Loan loan);

}