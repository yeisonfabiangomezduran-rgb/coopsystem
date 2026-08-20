package com.coopsystem.modules.loan.service;

import com.coopsystem.modules.loan.amortization.dto.AmortizationSchedule;
import com.coopsystem.modules.loan.amortization.dto.InstallmentCalculation;
import com.coopsystem.modules.loan.amortization.strategy.AmortizationStrategy;
import com.coopsystem.modules.loan.dto.request.LoanPaymentRequest;
import com.coopsystem.modules.loan.dto.response.LoanPaymentResponse;
import com.coopsystem.modules.loan.entity.InstallmentStatus;
import com.coopsystem.modules.loan.entity.Loan;
import com.coopsystem.modules.loan.entity.LoanInstallment;
import com.coopsystem.modules.loan.entity.LoanPaymentType;
import com.coopsystem.modules.loan.entity.LoanStatus;
import com.coopsystem.modules.loan.repository.LoanInstallmentRepository;
import com.coopsystem.modules.loan.repository.LoanRepository;
import com.coopsystem.modules.transaction.service.TransactionService;
import com.coopsystem.modules.treasury.dto.request.DepositTreasuryRequest;
import com.coopsystem.modules.treasury.service.TreasuryService;
import com.coopsystem.shared.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoanPaymentService {

    private final LoanRepository loanRepository;
    private final LoanInstallmentRepository loanInstallmentRepository;
    private final TreasuryService treasuryService;
    private final TransactionService transactionService;
    private final AmortizationStrategy amortizationStrategy;

    public LoanPaymentService(
            LoanRepository loanRepository,
            LoanInstallmentRepository loanInstallmentRepository,
            TreasuryService treasuryService,
            TransactionService transactionService,
            AmortizationStrategy amortizationStrategy) {

        this.loanRepository = loanRepository;
        this.loanInstallmentRepository = loanInstallmentRepository;
        this.treasuryService = treasuryService;
        this.transactionService = transactionService;
        this.amortizationStrategy = amortizationStrategy;
    }

    /**
     * Registra un pago sobre un préstamo.
     *
     * Tipos soportados:
     *
     * INSTALLMENT:
     * Pago normal de una o varias cuotas.
     *
     * PRINCIPAL_ABATEMENT:
     * Abono extraordinario directamente al capital.
     *
     * FULL_PAYMENT:
     * Pago total del saldo pendiente.
     */
    @Transactional
    public LoanPaymentResponse pay(
            Long loanId,
            LoanPaymentRequest request) {

        Loan loan = getLoan(loanId);

        validateLoan(loan);

        if (request == null) {
            throw new BusinessException(
                    "La información del pago es obligatoria");
        }

        BigDecimal paymentAmount = request.getAmount();

        validatePaymentAmount(paymentAmount);

        LoanPaymentType paymentType =
                request.getPaymentType();

        if (paymentType == null) {
            throw new BusinessException(
                    "El tipo de pago es obligatorio");
        }

        return switch (paymentType) {

            case INSTALLMENT ->
                    processInstallmentPayment(
                            loan,
                            paymentAmount
                    );

            case PRINCIPAL_ABATEMENT ->
                    processPrincipalAbatement(
                            loan,
                            paymentAmount
                    );

            case FULL_PAYMENT ->
                    processFullPayment(loan);
        };
    }

    // ============================================================
    // PAGO NORMAL DE CUOTA
    // ============================================================

    private LoanPaymentResponse processInstallmentPayment(
            Loan loan,
            BigDecimal paymentAmount) {

        List<LoanInstallment> pendingInstallments =
                getPendingInstallments(loan.getId());

        if (pendingInstallments.isEmpty()) {
            throw new BusinessException(
                    "El préstamo no tiene cuotas pendientes");
        }

        /*
         * Calculamos cuánto falta realmente por pagar
         * en todas las cuotas.
         */
        BigDecimal totalPendingAmount =
                calculatePendingAmount(
                        pendingInstallments
                );

        if (paymentAmount.compareTo(
                totalPendingAmount) > 0) {

            throw new BusinessException(
                    "El valor del pago no puede superar "
                            + "el saldo pendiente de "
                            + totalPendingAmount
            );
        }

        BigDecimal remainingPayment =
                paymentAmount;

        Integer lastInstallmentAffected =
                null;

        /*
         * El pago se distribuye desde la primera cuota
         * pendiente hacia las siguientes.
         */
        for (LoanInstallment installment :
                pendingInstallments) {

            if (remainingPayment.compareTo(
                    BigDecimal.ZERO) <= 0) {

                break;
            }

            BigDecimal paidAmount =
                    safeValue(
                            installment.getPaidAmount()
                    );

            BigDecimal totalPayment =
                    safeValue(
                            installment.getTotalPayment()
                    );

            BigDecimal installmentPending =
                    totalPayment.subtract(
                            paidAmount
                    );

            if (installmentPending.compareTo(
                    BigDecimal.ZERO) <= 0) {

                markInstallmentAsPaid(
                        installment
                );

                loanInstallmentRepository.save(
                        installment
                );

                continue;
            }

            /*
             * Pago suficiente para completar la cuota.
             */
            if (remainingPayment.compareTo(
                    installmentPending) >= 0) {

                installment.setPaidAmount(
                        totalPayment
                );

                markInstallmentAsPaid(
                        installment
                );

                remainingPayment =
                        remainingPayment.subtract(
                                installmentPending
                        );

            } else {

                /*
                 * Pago parcial de la cuota.
                 */
                BigDecimal newPaidAmount =
                        paidAmount.add(
                                remainingPayment
                        );

                installment.setPaidAmount(
                        newPaidAmount
                );

                installment.setStatus(
                        InstallmentStatus.PENDING
                );

                /*
                 * IMPORTANTE:
                 *
                 * remainingBalance representa el saldo
                 * de capital de la cuota, no el valor
                 * total del préstamo.
                 *
                 * Por eso NO lo reemplazamos aquí
                 * por:
                 *
                 * remainingBalance - payment
                 *
                 * porque el pago puede contener intereses.
                 */
                remainingPayment =
                        BigDecimal.ZERO;
            }

            lastInstallmentAffected =
                    installment.getInstallmentNumber();

            loanInstallmentRepository.save(
                    installment
            );
        }

        /*
         * Registrar el dinero recibido en tesorería.
         */
        treasuryService.deposit(
                new DepositTreasuryRequest(
                        paymentAmount
                )
        );

        /*
         * Registrar movimiento financiero.
         */
        transactionService.recordLoanPayment(
                loan,
                paymentAmount
        );

        /*
         * Verificar cuántas cuotas siguen pendientes.
         */
        long remainingInstallments =
                loanInstallmentRepository
                        .countByLoanIdAndStatus(
                                loan.getId(),
                                InstallmentStatus.PENDING
                        );

        /*
         * Si ya no existen cuotas pendientes,
         * cancelar el préstamo.
         */
        if (remainingInstallments == 0) {

            loan.setStatus(
                    LoanStatus.CANCELLED
            );

            loanRepository.save(loan);
        }

        /*
         * El frontend debe calcular el saldo pendiente
         * utilizando las cuotas pendientes.
         */
        BigDecimal currentPendingBalance =
                calculatePendingAmount(
                        getPendingInstallments(
                                loan.getId()
                        )
                );

        return new LoanPaymentResponse(
                loan.getLoanNumber(),
                lastInstallmentAffected,
                paymentAmount,
                (int) remainingInstallments,
                loan.getStatus().name()
        );
    }

    // ============================================================
    // ABONO A CAPITAL
    // ============================================================

    private LoanPaymentResponse processPrincipalAbatement(
            Loan loan,
            BigDecimal paymentAmount) {

        List<LoanInstallment> pendingInstallments =
                getPendingInstallments(
                        loan.getId()
                );

        if (pendingInstallments.isEmpty()) {

            throw new BusinessException(
                    "El préstamo no tiene capital pendiente");
        }

        /*
         * No permitimos abono a capital si existe
         * una cuota parcialmente pagada.
         */
        validateNoPartialInstallment(
                pendingInstallments
        );

        /*
         * Calcular capital pendiente.
         */
        BigDecimal outstandingPrincipal =
                calculateOutstandingPrincipal(
                        pendingInstallments
                );

        if (paymentAmount.compareTo(
                outstandingPrincipal) > 0) {

            throw new BusinessException(
                    "El valor del abono no puede superar "
                            + "el capital pendiente de "
                            + outstandingPrincipal
            );
        }

        /*
         * Nuevo capital.
         */
        BigDecimal newPrincipal =
                outstandingPrincipal.subtract(
                        paymentAmount
                );

        /*
         * Registrar ingreso.
         */
        treasuryService.deposit(
                new DepositTreasuryRequest(
                        paymentAmount
                )
        );

        /*
         * Registrar transacción.
         */
        transactionService.recordLoanPayment(
                loan,
                paymentAmount
        );

        /*
         * Si se pagó todo el capital,
         * cancelar préstamo.
         */
        if (newPrincipal.compareTo(
                BigDecimal.ZERO) == 0) {

            markAllPendingInstallmentsAsPaid(
                    pendingInstallments
            );

            loan.setStatus(
                    LoanStatus.CANCELLED
            );

            loanRepository.save(loan);

            return new LoanPaymentResponse(
                    loan.getLoanNumber(),
                    null,
                    paymentAmount,
                    0,
                    loan.getStatus().name()
            );
        }

        /*
         * Recalcular solamente las cuotas pendientes.
         */
        regeneratePendingSchedule(
                loan,
                pendingInstallments,
                newPrincipal
        );

        long remainingInstallments =
                loanInstallmentRepository
                        .countByLoanIdAndStatus(
                                loan.getId(),
                                InstallmentStatus.PENDING
                        );

        return new LoanPaymentResponse(
                loan.getLoanNumber(),
                null,
                paymentAmount,
                (int) remainingInstallments,
                loan.getStatus().name()
        );
    }

    // ============================================================
    // PAGO TOTAL
    // ============================================================

    private LoanPaymentResponse processFullPayment(
            Loan loan) {

        List<LoanInstallment> pendingInstallments =
                getPendingInstallments(
                        loan.getId()
                );

        if (pendingInstallments.isEmpty()) {

            throw new BusinessException(
                    "El préstamo no tiene saldo pendiente");
        }

        BigDecimal outstandingAmount =
                calculatePendingAmount(
                        pendingInstallments
                );

        if (outstandingAmount.compareTo(
                BigDecimal.ZERO) <= 0) {

            throw new BusinessException(
                    "El préstamo no tiene saldo pendiente");
        }

        /*
         * Marcar todas las cuotas pendientes
         * como pagadas.
         */
        markAllPendingInstallmentsAsPaid(
                pendingInstallments
        );

        /*
         * Registrar dinero recibido.
         */
        treasuryService.deposit(
                new DepositTreasuryRequest(
                        outstandingAmount
                )
        );

        /*
         * Registrar movimiento.
         */
        transactionService.recordLoanPayment(
                loan,
                outstandingAmount
        );

        /*
         * Cancelar préstamo.
         */
        loan.setStatus(
                LoanStatus.CANCELLED
        );

        loanRepository.save(loan);

        return new LoanPaymentResponse(
                loan.getLoanNumber(),
                null,
                outstandingAmount,
                0,
                loan.getStatus().name()
        );
    }

    // ============================================================
    // RECÁLCULO DEL CRONOGRAMA
    // ============================================================

    private void regeneratePendingSchedule(
            Loan loan,
            List<LoanInstallment> pendingInstallments,
            BigDecimal newPrincipal) {

        /*
         * Obtener todas las cuotas.
         */
        List<LoanInstallment> allInstallments =
                loanInstallmentRepository
                        .findByLoanIdOrderByInstallmentNumberAsc(
                                loan.getId()
                        );

        /*
         * Contar cuotas ya pagadas.
         */
        int paidInstallments =
                (int) allInstallments
                        .stream()
                        .filter(installment ->
                                installment.getStatus()
                                        == InstallmentStatus.PAID
                        )
                        .count();

        /*
         * Número de cuotas pendientes.
         */
        int remainingMonths =
                pendingInstallments.size();

        if (remainingMonths <= 0) {

            throw new BusinessException(
                    "No existen cuotas pendientes para recalcular");
        }

        /*
         * Fecha de la primera cuota pendiente.
         */
        LocalDate firstPendingDueDate =
                pendingInstallments
                        .get(0)
                        .getDueDate();

        /*
         * Crear objeto temporal para generar
         * el nuevo cronograma.
         */
        Loan calculationLoan =
                new Loan();

        calculationLoan.setAmount(
                newPrincipal
        );

        calculationLoan.setInterestRate(
                loan.getInterestRate()
        );

        calculationLoan.setTermMonths(
                remainingMonths
        );

        if (firstPendingDueDate != null) {

            calculationLoan.setApprovedAt(
                    firstPendingDueDate
                            .minusMonths(1)
                            .atStartOfDay()
            );

        } else {

            calculationLoan.setApprovedAt(
                    loan.getApprovedAt()
            );
        }

        calculationLoan.setStatus(
                LoanStatus.DISBURSED
        );

        /*
         * Generar nuevo cronograma.
         */
        AmortizationSchedule schedule =
                amortizationStrategy.generateSchedule(
                        calculationLoan
                );

        /*
         * Eliminar las cuotas pendientes actuales.
         */
        loanInstallmentRepository.deleteAll(
                pendingInstallments
        );

        /*
         * IMPORTANTE:
         *
         * Forzar los DELETE antes de insertar
         * las nuevas cuotas.
         */
        loanInstallmentRepository.flush();

        /*
         * Crear las nuevas cuotas.
         */
        List<LoanInstallment> newInstallments =
                schedule.getInstallments()
                        .stream()
                        .map(calculation ->
                                toEntity(
                                        loan,
                                        calculation,
                                        paidInstallments
                                )
                        )
                        .toList();

        /*
         * Guardar nuevas cuotas.
         */
        loanInstallmentRepository.saveAll(
                newInstallments
        );

        /*
         * Forzar INSERT.
         */
        loanInstallmentRepository.flush();
    }

    // ============================================================
    // CONVERSIÓN DE CUOTA
    // ============================================================

    private LoanInstallment toEntity(
            Loan loan,
            InstallmentCalculation calculation,
            int paidInstallments) {

        LoanInstallment installment =
                new LoanInstallment();

        installment.setLoan(
                loan
        );

        /*
         * Mantener numeración original.
         */
        installment.setInstallmentNumber(
                paidInstallments
                        + calculation
                        .getInstallmentNumber()
        );

        installment.setDueDate(
                calculation.getDueDate()
        );

        installment.setPrincipal(
                calculation.getPrincipal()
        );

        installment.setInterest(
                calculation.getInterest()
        );

        installment.setTotalPayment(
                calculation.getTotalPayment()
        );

        installment.setRemainingBalance(
                calculation.getRemainingBalance()
        );

        installment.setPaidAmount(
                BigDecimal.ZERO
        );

        installment.setStatus(
                InstallmentStatus.PENDING
        );

        installment.setPaidAt(
                null
        );

        return installment;
    }

    // ============================================================
    // CÁLCULOS
    // ============================================================

    /**
     * Calcula el total que todavía falta pagar
     * de las cuotas pendientes.
     */
    private BigDecimal calculatePendingAmount(
            List<LoanInstallment> installments) {

        BigDecimal total =
                BigDecimal.ZERO;

        for (LoanInstallment installment :
                installments) {

            BigDecimal totalPayment =
                    safeValue(
                            installment.getTotalPayment()
                    );

            BigDecimal paidAmount =
                    safeValue(
                            installment.getPaidAmount()
                    );

            BigDecimal pending =
                    totalPayment.subtract(
                            paidAmount
                    );

            if (pending.compareTo(
                    BigDecimal.ZERO) > 0) {

                total =
                        total.add(pending);
            }
        }

        return total;
    }

    /**
     * Calcula el capital pendiente.
     */
    private BigDecimal calculateOutstandingPrincipal(
            List<LoanInstallment> installments) {

        BigDecimal outstanding =
                BigDecimal.ZERO;

        for (LoanInstallment installment :
                installments) {

            BigDecimal principal =
                    safeValue(
                            installment.getPrincipal()
                    );

            BigDecimal interest =
                    safeValue(
                            installment.getInterest()
                    );

            BigDecimal paidAmount =
                    safeValue(
                            installment.getPaidAmount()
                    );

            /*
             * Parte del pago que corresponde
             * al capital.
             */
            BigDecimal principalPaid =
                    paidAmount
                            .subtract(interest)
                            .max(BigDecimal.ZERO)
                            .min(principal);

            BigDecimal pendingPrincipal =
                    principal
                            .subtract(
                                    principalPaid
                            )
                            .max(BigDecimal.ZERO);

            outstanding =
                    outstanding.add(
                            pendingPrincipal
                    );
        }

        return outstanding;
    }

    /**
     * Evita valores null.
     */
    private BigDecimal safeValue(
            BigDecimal value) {

        return value != null
                ? value
                : BigDecimal.ZERO;
    }

    // ============================================================
    // CUOTAS
    // ============================================================

    private List<LoanInstallment>
    getPendingInstallments(Long loanId) {

        return loanInstallmentRepository
                .findByLoanIdAndStatusOrderByInstallmentNumberAsc(
                        loanId,
                        InstallmentStatus.PENDING
                );
    }

    /**
     * Marca una cuota como pagada.
     */
    private void markInstallmentAsPaid(
            LoanInstallment installment) {

        installment.setPaidAmount(
                installment.getTotalPayment()
        );

        installment.setStatus(
                InstallmentStatus.PAID
        );

        installment.setPaidAt(
                LocalDateTime.now()
        );

        installment.setRemainingBalance(
                BigDecimal.ZERO
        );
    }

    /**
     * Marca todas las cuotas como pagadas.
     */
    private void markAllPendingInstallmentsAsPaid(
            List<LoanInstallment> installments) {

        LocalDateTime now =
                LocalDateTime.now();

        for (LoanInstallment installment :
                installments) {

            installment.setPaidAmount(
                    installment.getTotalPayment()
            );

            installment.setStatus(
                    InstallmentStatus.PAID
            );

            installment.setPaidAt(
                    now
            );

            installment.setRemainingBalance(
                    BigDecimal.ZERO
            );

            loanInstallmentRepository.save(
                    installment
            );
        }
    }

    /**
     * Evita abonos a capital mientras exista
     * una cuota parcialmente pagada.
     */
    private void validateNoPartialInstallment(
            List<LoanInstallment> installments) {

        boolean hasPartialPayment =
                installments
                        .stream()
                        .anyMatch(installment -> {

                            BigDecimal paidAmount =
                                    safeValue(
                                            installment
                                                    .getPaidAmount()
                                    );

                            BigDecimal totalPayment =
                                    safeValue(
                                            installment
                                                    .getTotalPayment()
                                    );

                            return paidAmount.compareTo(
                                    BigDecimal.ZERO
                            ) > 0
                                    &&
                                    paidAmount.compareTo(
                                            totalPayment
                                    ) < 0;
                        });

        if (hasPartialPayment) {

            throw new BusinessException(
                    "Primero debe completar la cuota "
                            + "que tiene un pago parcial "
                            + "antes de realizar un abono a capital"
            );
        }
    }

    // ============================================================
    // VALIDACIONES
    // ============================================================

    private Loan getLoan(Long loanId) {

        return loanRepository
                .findById(loanId)
                .orElseThrow(() ->
                        new BusinessException(
                                "El préstamo no existe"
                        )
                );
    }

    private void validateLoan(
            Loan loan) {

        if (loan.getStatus()
                != LoanStatus.DISBURSED) {

            throw new BusinessException(
                    "Solo se pueden pagar "
                            + "préstamos desembolsados"
            );
        }
    }

    private void validatePaymentAmount(
            BigDecimal paymentAmount) {

        if (paymentAmount == null) {

            throw new BusinessException(
                    "El valor del pago es obligatorio"
            );
        }

        if (paymentAmount.compareTo(
                BigDecimal.ZERO) <= 0) {

            throw new BusinessException(
                    "El valor del pago debe ser mayor que cero"
            );
        }
    }
}