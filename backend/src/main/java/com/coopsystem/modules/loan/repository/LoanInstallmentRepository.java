package com.coopsystem.modules.loan.repository;

import com.coopsystem.modules.loan.entity.InstallmentStatus;
import com.coopsystem.modules.loan.entity.LoanInstallment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface LoanInstallmentRepository
        extends JpaRepository<LoanInstallment, Long> {

    List<LoanInstallment> findByLoanIdOrderByInstallmentNumberAsc(
            Long loanId);

    Optional<LoanInstallment>
    findFirstByLoanIdAndStatusOrderByInstallmentNumberAsc(
            Long loanId,
            InstallmentStatus status);

    long countByLoanIdAndStatus(
            Long loanId,
            InstallmentStatus status);

    List<LoanInstallment> findByStatus(
            InstallmentStatus status);

    List<LoanInstallment> findByLoanIdAndStatusOrderByInstallmentNumberAsc(
            Long loanId,
            InstallmentStatus status
    );

    /**
     * Capital pendiente de préstamos desembolsados.
     *
     * Replica LoanPaymentService.calculateOutstandingPrincipal:
     * principalPaid = min(principal, max(0, paidAmount - interest))
     * pendingPrincipal = max(0, principal - principalPaid)
     */
    @Query(value = """
            SELECT COALESCE(SUM(
                GREATEST(
                    i.principal - LEAST(
                        i.principal,
                        GREATEST(
                            0,
                            COALESCE(i.paid_amount, 0) - i.interest
                        )
                    ),
                    0
                )
            ), 0)
            FROM loan_installments i
            INNER JOIN loans l ON l.id = i.loan_id
            WHERE i.status = 'PENDING'
              AND l.status = 'DISBURSED'
            """, nativeQuery = true)
    BigDecimal sumOutstandingPrincipalForDisbursedLoans();
}
