package com.coopsystem.modules.loan.repository;

import com.coopsystem.modules.loan.entity.InstallmentStatus;
import com.coopsystem.modules.loan.entity.LoanInstallment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoanInstallmentRepository
        extends JpaRepository<LoanInstallment, Long> {

    /**
     * Obtiene todas las cuotas de un préstamo ordenadas por número.
     */
    List<LoanInstallment> findByLoanIdOrderByInstallmentNumberAsc(Long loanId);

    /**
     * Obtiene la siguiente cuota pendiente.
     */
    Optional<LoanInstallment> findFirstByLoanIdAndStatusOrderByInstallmentNumberAsc(
            Long loanId,
            InstallmentStatus status
    );

    /**
     * Obtiene todas las cuotas con un estado específico.
     */
    List<LoanInstallment> findByStatus(InstallmentStatus status);

}