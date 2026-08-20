package com.coopsystem.modules.loan.repository;

import com.coopsystem.modules.loan.entity.InstallmentStatus;
import com.coopsystem.modules.loan.entity.LoanInstallment;
import org.springframework.data.jpa.repository.JpaRepository;

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

}