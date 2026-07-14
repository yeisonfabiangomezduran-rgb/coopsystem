package com.coopsystem.modules.loan.service;

import com.coopsystem.modules.loan.amortization.dto.AmortizationSchedule;
import com.coopsystem.modules.loan.amortization.dto.InstallmentCalculation;
import com.coopsystem.modules.loan.amortization.strategy.AmortizationStrategy;
import com.coopsystem.modules.loan.dto.response.LoanInstallmentResponse;
import com.coopsystem.modules.loan.entity.InstallmentStatus;
import com.coopsystem.modules.loan.entity.Loan;
import com.coopsystem.modules.loan.entity.LoanInstallment;
import com.coopsystem.modules.loan.entity.LoanStatus;
import com.coopsystem.modules.loan.repository.LoanInstallmentRepository;
import com.coopsystem.modules.loan.repository.LoanRepository;
import com.coopsystem.shared.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LoanInstallmentService {

    private final LoanRepository loanRepository;
    private final LoanInstallmentRepository loanInstallmentRepository;
    private final AmortizationStrategy amortizationStrategy;

    public LoanInstallmentService(
            LoanRepository loanRepository,
            LoanInstallmentRepository loanInstallmentRepository,
            AmortizationStrategy amortizationStrategy) {

        this.loanRepository = loanRepository;
        this.loanInstallmentRepository = loanInstallmentRepository;
        this.amortizationStrategy = amortizationStrategy;
    }

    /**
     * Genera el cronograma de pagos de un préstamo.
     */
    @Transactional
    public void generateSchedule(Long loanId) {

        Loan loan = getLoan(loanId);

        if (loan.getStatus() != LoanStatus.DISBURSED) {
            throw new BusinessException(
                    "El cronograma solo puede generarse para préstamos desembolsados");
        }

        if (!loanInstallmentRepository
                .findByLoanIdOrderByInstallmentNumberAsc(loanId)
                .isEmpty()) {

            throw new BusinessException(
                    "El préstamo ya tiene un cronograma generado");
        }

        AmortizationSchedule schedule =
                amortizationStrategy.generateSchedule(loan);

        saveInstallments(loan, schedule);
    }

    /**
     * Obtiene un préstamo por su ID.
     */
    private Loan getLoan(Long loanId) {

        return loanRepository.findById(loanId)
                .orElseThrow(() ->
                        new BusinessException(
                                "El préstamo no existe"));
    }

    // Los siguientes métodos los implementaremos en el siguiente bloque.
    /**
 * Convierte el cronograma generado en entidades y las guarda.
 */
private void saveInstallments(
        Loan loan,
        AmortizationSchedule schedule) {

    List<LoanInstallment> installments =
            schedule.getInstallments()
                    .stream()
                    .map(calculation ->
                            toEntity(loan, calculation))
                    .toList();

    loanInstallmentRepository.saveAll(installments);
}

/**
 * Convierte un cálculo de amortización en una entidad.
 */
private LoanInstallment toEntity(
        Loan loan,
        InstallmentCalculation calculation) {

    LoanInstallment installment = new LoanInstallment();

    installment.setLoan(loan);
    installment.setInstallmentNumber(
            calculation.getInstallmentNumber());

    installment.setDueDate(
            calculation.getDueDate());

    installment.setPrincipal(
            calculation.getPrincipal());

    installment.setInterest(
            calculation.getInterest());

    installment.setTotalPayment(
            calculation.getTotalPayment());

    installment.setRemainingBalance(
            calculation.getRemainingBalance());

    installment.setStatus(
            InstallmentStatus.PENDING);

    installment.setPaidAt(null);

    return installment;
}

/**
 * Obtiene el cronograma de un préstamo.
 */
@Transactional(readOnly = true)
public List<LoanInstallmentResponse> findByLoan(Long loanId) {

    getLoan(loanId);

    return loanInstallmentRepository
            .findByLoanIdOrderByInstallmentNumberAsc(loanId)
            .stream()
            .map(this::toResponse)
            .toList();
}

/**
 * Convierte una entidad en DTO de respuesta.
 */
private LoanInstallmentResponse toResponse(
        LoanInstallment installment) {

    return new LoanInstallmentResponse(
            installment.getInstallmentNumber(),
            installment.getDueDate(),
            installment.getPrincipal(),
            installment.getInterest(),
            installment.getTotalPayment(),
            installment.getRemainingBalance(),
            installment.getStatus().name(),
            installment.getPaidAt()
    );
}

}