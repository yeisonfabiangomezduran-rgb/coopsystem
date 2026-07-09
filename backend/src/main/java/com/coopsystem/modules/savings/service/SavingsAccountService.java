package com.coopsystem.modules.savings.service;

import com.coopsystem.modules.associate.entity.Associate;
import com.coopsystem.modules.associate.repository.AssociateRepository;
import com.coopsystem.modules.savings.dto.CreateSavingsAccountRequest;
import com.coopsystem.modules.savings.dto.DepositRequest;
import com.coopsystem.modules.savings.dto.DepositResponse;
import com.coopsystem.modules.savings.dto.SavingsAccountResponse;
import com.coopsystem.modules.savings.dto.WithdrawRequest;
import com.coopsystem.modules.savings.dto.WithdrawResponse;
import com.coopsystem.modules.savings.entity.AccountStatus;
import com.coopsystem.modules.savings.entity.SavingsAccount;
import com.coopsystem.modules.savings.repository.SavingsAccountRepository;
import com.coopsystem.modules.transaction.dto.TransactionResponse;
import com.coopsystem.modules.transaction.entity.Transaction;
import com.coopsystem.modules.transaction.entity.TransactionType;
import com.coopsystem.modules.transaction.repository.TransactionRepository;
import com.coopsystem.shared.exception.BusinessException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SavingsAccountService {

    private final SavingsAccountRepository savingsAccountRepository;
    private final AssociateRepository associateRepository;
    private final TransactionRepository transactionRepository;

    public SavingsAccountService(
            SavingsAccountRepository savingsAccountRepository,
            AssociateRepository associateRepository,
            TransactionRepository transactionRepository) {

        this.savingsAccountRepository = savingsAccountRepository;
        this.associateRepository = associateRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<SavingsAccountResponse> findAll() {

        return savingsAccountRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public SavingsAccountResponse findById(Long id) {

        SavingsAccount account = savingsAccountRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("La cuenta de ahorro no existe"));

        return toResponse(account);
    }

    public SavingsAccountResponse findByAccountNumber(String accountNumber) {

        SavingsAccount account = savingsAccountRepository
                .findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new BusinessException("La cuenta de ahorro no existe"));

        return toResponse(account);
    }

    public List<TransactionResponse> findTransactions(Long accountId) {

        savingsAccountRepository.findById(accountId)
                .orElseThrow(() ->
                        new BusinessException("La cuenta de ahorro no existe"));

        return transactionRepository
                .findBySavingsAccountIdOrderByTransactionDateDesc(accountId)
                .stream()
                .map(transaction ->
                        new TransactionResponse(
                                transaction.getTransactionType().name(),
                                transaction.getAmount(),
                                transaction.getPreviousBalance(),
                                transaction.getCurrentBalance(),
                                transaction.getTransactionDate()
                        ))
                .toList();
    }

    public SavingsAccountResponse create(CreateSavingsAccountRequest request) {

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

    public DepositResponse deposit(
            Long id,
            DepositRequest request) {

        SavingsAccount account = savingsAccountRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("La cuenta de ahorro no existe"));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException("La cuenta no está activa");
        }

        BigDecimal previousBalance = account.getBalance();

        BigDecimal currentBalance =
                previousBalance.add(request.getAmount());

        account.setBalance(currentBalance);

        savingsAccountRepository.save(account);

        saveTransaction(
                account,
                TransactionType.DEPOSIT,
                request.getAmount(),
                previousBalance,
                currentBalance
        );

        return new DepositResponse(
                account.getAccountNumber(),
                previousBalance,
                request.getAmount(),
                currentBalance
        );
    }

    public WithdrawResponse withdraw(
            Long id,
            WithdrawRequest request) {

        SavingsAccount account = savingsAccountRepository.findById(id)
                .orElseThrow(() ->
                        new BusinessException("La cuenta de ahorro no existe"));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException("La cuenta no está activa");
        }

        BigDecimal previousBalance = account.getBalance();

        if (previousBalance.compareTo(request.getAmount()) < 0) {
            throw new BusinessException("Saldo insuficiente");
        }

        BigDecimal currentBalance =
                previousBalance.subtract(request.getAmount());

        account.setBalance(currentBalance);

        savingsAccountRepository.save(account);

        saveTransaction(
                account,
                TransactionType.WITHDRAW,
                request.getAmount(),
                previousBalance,
                currentBalance
        );

        return new WithdrawResponse(
                account.getAccountNumber(),
                previousBalance,
                request.getAmount(),
                currentBalance
        );
    }

    private String generateAccountNumber() {

        long total = savingsAccountRepository.count() + 1;

        return String.valueOf(100000000L + total);
    }

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

    private void saveTransaction(
            SavingsAccount account,
            TransactionType type,
            BigDecimal amount,
            BigDecimal previousBalance,
            BigDecimal currentBalance) {

        Transaction transaction = new Transaction();

        transaction.setSavingsAccount(account);
        transaction.setTransactionType(type);
        transaction.setAmount(amount);
        transaction.setPreviousBalance(previousBalance);
        transaction.setCurrentBalance(currentBalance);
        transaction.setTransactionDate(LocalDateTime.now());

        transactionRepository.save(transaction);
    }
}