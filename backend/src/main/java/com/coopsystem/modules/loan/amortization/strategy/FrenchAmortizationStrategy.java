package com.coopsystem.modules.loan.amortization.strategy;

import com.coopsystem.modules.loan.amortization.dto.AmortizationSchedule;
import com.coopsystem.modules.loan.amortization.dto.InstallmentCalculation;
import com.coopsystem.modules.loan.amortization.util.FinancialFormula;
import com.coopsystem.modules.loan.entity.Loan;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class FrenchAmortizationStrategy implements AmortizationStrategy {

    @Override
    public AmortizationSchedule generateSchedule(Loan loan) {

        BigDecimal monthlyPayment =
                FinancialFormula.calculateMonthlyPayment(
                        loan.getAmount(),
                        loan.getInterestRate(),
                        loan.getTermMonths()
                );

        AmortizationSchedule schedule =
                new AmortizationSchedule();

        schedule.setMonthlyPayment(monthlyPayment);

        buildInstallments(
                loan,
                monthlyPayment,
                schedule
        );

        return schedule;
    }

    /**
     * Genera todas las cuotas del préstamo.
     */
    private void buildInstallments(
            Loan loan,
            BigDecimal monthlyPayment,
            AmortizationSchedule schedule) {

        BigDecimal balance = loan.getAmount();

        BigDecimal totalInterest = BigDecimal.ZERO;

        for (int installment = 1;
             installment <= loan.getTermMonths();
             installment++) {

            BigDecimal interest;
            BigDecimal principal;
            BigDecimal payment;
            BigDecimal remainingBalance;

            boolean lastInstallment =
                    installment == loan.getTermMonths();

            if (lastInstallment) {

                // Última cuota: se ajusta el capital para dejar saldo en cero.
                interest = FinancialFormula.calculateInterest(
                        balance,
                        loan.getInterestRate());

                principal = balance;

                payment = principal.add(interest);

                remainingBalance = BigDecimal.ZERO;

            } else {

                interest = FinancialFormula.calculateInterest(
                        balance,
                        loan.getInterestRate());

                payment = monthlyPayment;

                principal = FinancialFormula.calculatePrincipal(
                        payment,
                        interest);

                remainingBalance =
                        FinancialFormula.calculateRemainingBalance(
                                balance,
                                principal);
            }

            LocalDate dueDate = loan.getApprovedAt() != null
                    ? loan.getApprovedAt()
                            .toLocalDate()
                            .plusMonths(installment)
                    : LocalDate.now().plusMonths(installment);

            InstallmentCalculation calculation =
                    buildInstallment(
                            installment,
                            dueDate,
                            principal,
                            interest,
                            payment,
                            remainingBalance
                    );

            schedule.getInstallments().add(calculation);

            totalInterest = totalInterest.add(interest);

            balance = remainingBalance;
        }

        schedule.setTotalInterest(totalInterest);

        schedule.setTotalAmount(
                loan.getAmount().add(totalInterest));
    }

    /**
     * Construye una cuota del cronograma.
     */
    private InstallmentCalculation buildInstallment(
            Integer installmentNumber,
            LocalDate dueDate,
            BigDecimal principal,
            BigDecimal interest,
            BigDecimal payment,
            BigDecimal remainingBalance) {

        return new InstallmentCalculation(
                installmentNumber,
                dueDate,
                principal,
                interest,
                payment,
                remainingBalance
        );
    }

}