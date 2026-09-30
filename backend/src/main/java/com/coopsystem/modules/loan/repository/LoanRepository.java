package com.coopsystem.modules.loan.repository;

import com.coopsystem.modules.loan.entity.Loan;
import com.coopsystem.modules.loan.entity.LoanStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    Optional<Loan> findByLoanNumber(String loanNumber);

    long countByStatus(LoanStatus status);

    @EntityGraph(attributePaths = "associate")
    List<Loan> findByAssociate_IdOrderByRequestedAtDesc(Long associateId);
}
