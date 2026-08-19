package com.coopsystem.modules.savings.service;

import com.coopsystem.modules.associate.entity.Associate;
import com.coopsystem.modules.associate.repository.AssociateRepository;
import com.coopsystem.modules.savings.dto.CreateSavingsAccountRequest;
import com.coopsystem.modules.savings.dto.SavingsAccountResponse;
import com.coopsystem.modules.savings.dto.UpdateSavingsAccountStatusRequest;
import com.coopsystem.modules.savings.entity.AccountStatus;
import com.coopsystem.modules.savings.entity.SavingsAccount;
import com.coopsystem.modules.savings.repository.SavingsAccountRepository;
import com.coopsystem.shared.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SavingsAccountService {

    private final SavingsAccountRepository savingsAccountRepository;
    private final AssociateRepository associateRepository;

    public SavingsAccountService(
            SavingsAccountRepository savingsAccountRepository,
            AssociateRepository associateRepository) {

        this.savingsAccountRepository = savingsAccountRepository;
        this.associateRepository = associateRepository;
    }

    @Transactional(readOnly = true)
    public List<SavingsAccountResponse> findAll() {

        return savingsAccountRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SavingsAccountResponse findById(Long id) {

        SavingsAccount account = savingsAccountRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("La cuenta de ahorro no existe"));

        return toResponse(account);
    }

    @Transactional(readOnly = true)
    public SavingsAccountResponse findByAccountNumber(String accountNumber) {

        SavingsAccount account = savingsAccountRepository
                .findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new BusinessException("La cuenta de ahorro no existe"));

        return toResponse(account);
    }

    @Transactional
    public SavingsAccountResponse create(CreateSavingsAccountRequest request) {

        if (savingsAccountRepository.existsByAssociateId(request.getAssociateId())) {
            throw new BusinessException(
                    "El asociado ya tiene una cuenta de ahorro");
        }

        Associate associate = associateRepository.findById(request.getAssociateId())
                .orElseThrow(() ->
                        new BusinessException("El asociado no existe"));

        SavingsAccount account = new SavingsAccount();

        account.setAssociate(associate);
        account.setBalance(BigDecimal.ZERO);
        account.setStatus(AccountStatus.ACTIVE);
        account.setOpenedAt(LocalDateTime.now());
        account.setAccountNumber(generateAccountNumber());

        SavingsAccount saved = savingsAccountRepository.save(account);

        return toResponse(saved);
    }

    @Transactional
    public SavingsAccountResponse updateStatus(
            Long id,
            UpdateSavingsAccountStatusRequest request) {

        SavingsAccount account = savingsAccountRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("La cuenta de ahorro no existe"));

        account.setStatus(request.getStatus());

        return toResponse(savingsAccountRepository.save(account));
    }

    /**
     * Genera el número consecutivo de la cuenta de ahorro.
     */
    private String generateAccountNumber() {

        long total = savingsAccountRepository.count() + 1;

        return String.valueOf(100000000L + total);
    }

    /**
     * Convierte la entidad en DTO.
     */
    private SavingsAccountResponse toResponse(SavingsAccount account) {

        return new SavingsAccountResponse(
                account.getId(),
                account.getAccountNumber(),
                account.getBalance(),
                account.getStatus().name(),
                account.getOpenedAt(),
                account.getAssociate().getId()
        );
    }
}
