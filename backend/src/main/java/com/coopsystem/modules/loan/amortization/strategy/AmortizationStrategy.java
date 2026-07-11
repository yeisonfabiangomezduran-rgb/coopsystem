package com.coopsystem.modules.loan.amortization.strategy;

import com.coopsystem.modules.loan.entity.Loan;
import com.coopsystem.modules.loan.entity.LoanInstallment;

import java.util.List;

/**
 * Define el contrato para los diferentes sistemas de amortización.
 */
public interface AmortizationStrategy {

    /**
     * Genera el cronograma de cuotas de un préstamo.
     *
     * @param loan préstamo a amortizar
     * @return lista de cuotas generadas
     */
    List<LoanInstallment> generateSchedule(Loan loan);

}