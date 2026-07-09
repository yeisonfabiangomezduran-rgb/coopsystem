package com.coopsystem.modules.loan.service;

import com.coopsystem.modules.associate.entity.Associate;
import com.coopsystem.modules.associate.repository.AssociateRepository;
import com.coopsystem.modules.loan.dto.request.CreateLoanRequest;
import com.coopsystem.modules.loan.dto.response.LoanResponse;
import com.coopsystem.modules.loan.entity.Loan;
import com.coopsystem.modules.loan.entity.LoanStatus;
import com.coopsystem.modules.loan.repository.LoanRepository;
import com.coopsystem.shared.exception.BusinessException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoanService {

    private final LoanRepository loanRepository;
    private final AssociateRepository associateRepository;

    public LoanService(
            LoanRepository loanRepository,
            AssociateRepository associateRepository) {

        this.loanRepository = loanRepository;
        this.associateRepository = associateRepository;
    }

    public List<LoanResponse> findAll() {

        return loanRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public LoanResponse findById(Long id) {

        Loan loan = loanRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("El préstamo no existe"));

        return toResponse(loan);
    }

    public LoanResponse findByLoanNumber(String loanNumber) {

        Loan loan = loanRepository.findByLoanNumber(loanNumber)
                .orElseThrow(() ->
                        new BusinessException("El préstamo no existe"));

        return toResponse(loan);
    }

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

    private String generateLoanNumber() {

        long total = loanRepository.count() + 1;

        return String.valueOf(200000000L + total);
    }

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