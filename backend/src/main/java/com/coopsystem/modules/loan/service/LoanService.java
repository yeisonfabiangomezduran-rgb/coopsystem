package com.coopsystem.modules.loan.service;

import com.coopsystem.modules.associate.entity.Associate;
import com.coopsystem.modules.associate.repository.AssociateRepository;
import com.coopsystem.modules.loan.dto.request.CreateLoanRequest;
import com.coopsystem.modules.loan.dto.response.LoanResponse;
import com.coopsystem.modules.loan.entity.Loan;
import com.coopsystem.modules.loan.entity.LoanStatus;
import com.coopsystem.modules.loan.repository.LoanRepository;
import com.coopsystem.modules.transaction.service.TransactionService;
import com.coopsystem.modules.treasury.service.TreasuryService;
import com.coopsystem.shared.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final AssociateRepository associateRepository;
    private final TransactionService transactionService;
    private final TreasuryService treasuryService;
    private final LoanInstallmentService loanInstallmentService;

    public LoanService(
            LoanRepository loanRepository,
            AssociateRepository associateRepository,
            TransactionService transactionService,
            TreasuryService treasuryService,
            LoanInstallmentService loanInstallmentService) {

        this.loanRepository = loanRepository;
        this.associateRepository = associateRepository;
        this.transactionService = transactionService;
        this.treasuryService = treasuryService;
        this.loanInstallmentService = loanInstallmentService;
    }

    @Transactional(readOnly = true)
    public List<LoanResponse> findAll() {

        return loanRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public LoanResponse findById(Long id) {

        return toResponse(getLoan(id));
    }

    @Transactional(readOnly = true)
    public LoanResponse findByLoanNumber(String loanNumber) {

        Loan loan = loanRepository.findByLoanNumber(loanNumber)
                .orElseThrow(() ->
                        new BusinessException("El préstamo no existe"));

        return toResponse(loan);
    }

    @Transactional
    public LoanResponse create(CreateLoanRequest request) {

        Associate associate = associateRepository.findById(request.getAssociateId())
                .orElseThrow(() ->
                        new BusinessException("El asociado no existe"));

        Loan loan = new Loan();

        loan.setLoanNumber(generateLoanNumber());
        loan.setAssociate(associate);
        loan.setAmount(request.getAmount());
        loan.setInterestRate(request.getInterestRate());
        loan.setTermMonths(request.getTermMonths());
        loan.setStatus(LoanStatus.PENDING);
        loan.setRequestedAt(LocalDateTime.now());

        Loan saved = loanRepository.save(loan);

        return toResponse(saved);
    }

    @Transactional
    public LoanResponse approve(Long id) {

        Loan loan = getLoan(id);

        validatePendingLoan(loan);

        loan.setStatus(LoanStatus.APPROVED);
        loan.setApprovedAt(LocalDateTime.now());

        Loan updated = loanRepository.save(loan);

        return toResponse(updated);
    }

    @Transactional
    public LoanResponse reject(Long id) {

        Loan loan = getLoan(id);

        validatePendingLoan(loan);

        loan.setStatus(LoanStatus.REJECTED);

        Loan updated = loanRepository.save(loan);

        return toResponse(updated);
    }

    @Transactional
    public LoanResponse disburse(Long id) {

        Loan loan = getLoan(id);

        if (loan.getStatus() != LoanStatus.APPROVED) {
            throw new BusinessException(
                    "Solo se pueden desembolsar préstamos aprobados");
        }

        // Retira el dinero de la Caja General
        treasuryService.withdrawLoan(
                loan.getAmount());

        // Consigna el dinero en la cuenta de ahorro del asociado
        transactionService.depositLoan(
                loan.getAssociate().getId(),
                loan.getAmount());

        // Cambia el estado del préstamo
        loan.setStatus(LoanStatus.DISBURSED);

        Loan updated = loanRepository.save(loan);

        // Genera automáticamente el cronograma de pagos
        loanInstallmentService.generateSchedule(
                updated.getId());

        return toResponse(updated);
    }

    /**
     * Obtiene un préstamo por su ID.
     */
    private Loan getLoan(Long id) {

        return loanRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("El préstamo no existe"));
    }

    /**
     * Valida que el préstamo esté pendiente.
     */
    private void validatePendingLoan(Loan loan) {

        if (loan.getStatus() != LoanStatus.PENDING) {
            throw new BusinessException(
                    "La operación solo está permitida para préstamos pendientes");
        }
    }

    /**
     * Genera el número consecutivo del préstamo.
     */
    private String generateLoanNumber() {

        long total = loanRepository.count() + 1;

        return String.valueOf(200000000L + total);
    }

    /**
     * Convierte la entidad en DTO.
     */
    private LoanResponse toResponse(Loan loan) {

        return new LoanResponse(
                loan.getId(),
                loan.getLoanNumber(),
                loan.getAssociate().getId(),
                loan.getAmount(),
                loan.getInterestRate(),
                loan.getTermMonths(),
                loan.getStatus().name(),
                loan.getRequestedAt(),
                loan.getApprovedAt()
        );
    }
}