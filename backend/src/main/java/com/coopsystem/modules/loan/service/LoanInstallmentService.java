package com.coopsystem.modules.loan.service;

import com.coopsystem.modules.loan.entity.Loan;
import com.coopsystem.modules.loan.entity.LoanInstallment;
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

    public LoanInstallmentService(
            LoanRepository loanRepository,
            LoanInstallmentRepository loanInstallmentRepository) {

        this.loanRepository = loanRepository;
        this.loanInstallmentRepository = loanInstallmentRepository;
    }

    @Transactional
    public void generateSchedule(Long loanId) {

        Loan loan = getLoan(loanId);

        // Aquí construiremos el algoritmo de amortización.
    }

    @Transactional(readOnly = true)
    public List<LoanInstallment> findByLoan(Long loanId) {

        getLoan(loanId);

        return loanInstallmentRepository
                .findByLoanIdOrderByInstallmentNumberAsc(loanId);
    }

    /**
     * Obtiene un préstamo por su ID.
     */
    private Loan getLoan(Long loanId) {

        return loanRepository.findById(loanId)
                .orElseThrow(() ->
                        new BusinessException("El préstamo no existe"));
    }
}