package com.coopsystem.modules.loan.service;

import com.coopsystem.modules.loan.dto.request.LoanPaymentRequest;
import com.coopsystem.modules.loan.dto.response.LoanPaymentResponse;
import com.coopsystem.modules.loan.entity.InstallmentStatus;
import com.coopsystem.modules.loan.entity.Loan;
import com.coopsystem.modules.loan.entity.LoanInstallment;
import com.coopsystem.modules.loan.entity.LoanStatus;
import com.coopsystem.modules.loan.repository.LoanInstallmentRepository;
import com.coopsystem.modules.loan.repository.LoanRepository;
import com.coopsystem.modules.treasury.dto.request.DepositTreasuryRequest;
import com.coopsystem.modules.treasury.service.TreasuryService;
import com.coopsystem.shared.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class LoanPaymentService {

    private final LoanRepository loanRepository;
    private final LoanInstallmentRepository loanInstallmentRepository;
    private final TreasuryService treasuryService;

    public LoanPaymentService(
            LoanRepository loanRepository,
            LoanInstallmentRepository loanInstallmentRepository,
            TreasuryService treasuryService) {

        this.loanRepository = loanRepository;
        this.loanInstallmentRepository = loanInstallmentRepository;
        this.treasuryService = treasuryService;
    }

    /**
     * Registra el pago de la siguiente cuota pendiente.
     */
    @Transactional
    public LoanPaymentResponse pay(
            Long loanId,
            LoanPaymentRequest request) {

        Loan loan = getLoan(loanId);

        validateLoan(loan);

        LoanInstallment installment =
                getNextPendingInstallment(loanId);

        validateAmount(
                installment,
                request);

        // Marcar la cuota como pagada
        installment.setStatus(InstallmentStatus.PAID);
        installment.setPaidAt(LocalDateTime.now());

        loanInstallmentRepository.save(installment);

        // Registrar ingreso en Tesorería
        treasuryService.deposit(
                new DepositTreasuryRequest(
                        installment.getTotalPayment()
                )
        );

        // Contar las cuotas pendientes
        long remainingInstallments =
                loanInstallmentRepository.countByLoanIdAndStatus(
                        loanId,
                        InstallmentStatus.PENDING
                );

        // Si ya no quedan cuotas, cancelar el préstamo
        if (remainingInstallments == 0) {

            loan.setStatus(LoanStatus.CANCELLED);

            loanRepository.save(loan);
        }

        return new LoanPaymentResponse(
                loan.getLoanNumber(),
                installment.getInstallmentNumber(),
                installment.getTotalPayment(),
                (int) remainingInstallments,
                loan.getStatus().name()
        );
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

    /**
     * Valida que el préstamo esté desembolsado.
     */
    private void validateLoan(Loan loan) {

        if (loan.getStatus() != LoanStatus.DISBURSED) {
            throw new BusinessException(
                    "Solo se pueden pagar préstamos desembolsados");
        }
    }

    /**
     * Obtiene la siguiente cuota pendiente.
     */
    private LoanInstallment getNextPendingInstallment(
            Long loanId) {

        return loanInstallmentRepository
                .findFirstByLoanIdAndStatusOrderByInstallmentNumberAsc(
                        loanId,
                        InstallmentStatus.PENDING)
                .orElseThrow(() ->
                        new BusinessException(
                                "El préstamo no tiene cuotas pendientes"));
    }

    /**
     * Valida que el valor pagado corresponda exactamente
     * al valor de la cuota.
     */
    private void validateAmount(
            LoanInstallment installment,
            LoanPaymentRequest request) {

        if (installment.getTotalPayment()
                .compareTo(request.getAmount()) != 0) {

            throw new BusinessException(
                    "El valor pagado no corresponde al valor de la cuota");
        }
    }

}