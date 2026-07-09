package com.coopsystem.modules.transaction.service;

import com.coopsystem.modules.savings.entity.AccountStatus;
import com.coopsystem.modules.savings.entity.SavingsAccount;
import com.coopsystem.modules.savings.repository.SavingsAccountRepository;
import com.coopsystem.modules.transaction.dto.DepositRequest;
import com.coopsystem.modules.transaction.dto.DepositResponse;
import com.coopsystem.modules.transaction.dto.TransactionResponse;
import com.coopsystem.modules.transaction.dto.WithdrawRequest;
import com.coopsystem.modules.transaction.dto.WithdrawResponse;
import com.coopsystem.modules.transaction.entity.Transaction;
import com.coopsystem.modules.transaction.entity.TransactionType;
import com.coopsystem.modules.transaction.repository.TransactionRepository;
import com.coopsystem.shared.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final SavingsAccountRepository savingsAccountRepository;

    public TransactionService(
            TransactionRepository transactionRepository,
            SavingsAccountRepository savingsAccountRepository) {

        this.transactionRepository = transactionRepository;
        this.savingsAccountRepository = savingsAccountRepository;
    }

    @Transactional
    public DepositResponse deposit(
            Long savingsAccountId,
            DepositRequest request) {

        SavingsAccount account = getActiveAccount(savingsAccountId);

        BigDecimal previousBalance = account.getBalance();
        BigDecimal currentBalance = previousBalance.add(request.getAmount());

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

    @Transactional
    public WithdrawResponse withdraw(
            Long savingsAccountId,
            WithdrawRequest request) {

        SavingsAccount account = getActiveAccount(savingsAccountId);

        BigDecimal previousBalance = account.getBalance();

        if (previousBalance.compareTo(request.getAmount()) < 0) {
            throw new BusinessException("Saldo insuficiente");
        }

        BigDecimal currentBalance = previousBalance.subtract(request.getAmount());

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

    @Transactional(readOnly = true)
    public List<TransactionResponse> findTransactions(Long savingsAccountId) {

        getAccount(savingsAccountId);

        return transactionRepository
                .findBySavingsAccountIdOrderByTransactionDateDesc(savingsAccountId)
                .stream()
                .map(transaction -> new TransactionResponse(
                        transaction.getTransactionType().name(),
                        transaction.getAmount(),
                        transaction.getPreviousBalance(),
                        transaction.getCurrentBalance(),
                        transaction.getTransactionDate()
                ))
                .toList();
    }

    /**
     * Obtiene una cuenta de ahorro por su ID.
     */
    private SavingsAccount getAccount(Long savingsAccountId) {

        return savingsAccountRepository.findById(savingsAccountId)
                .orElseThrow(() ->
                        new BusinessException("La cuenta de ahorro no existe"));
    }

    /**
     * Obtiene una cuenta y valida que esté activa.
     */
    private SavingsAccount getActiveAccount(Long savingsAccountId) {

        SavingsAccount account = getAccount(savingsAccountId);

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new BusinessException("La cuenta no está activa");
        }

        return account;
    }

    /**
     * Registra una transacción financiera.
     */
    private void saveTransaction(
            SavingsAccount account,
            TransactionType transactionType,
            BigDecimal amount,
            BigDecimal previousBalance,
            BigDecimal currentBalance) {

        Transaction transaction = new Transaction();

        transaction.setSavingsAccount(account);
        transaction.setTransactionType(transactionType);
        transaction.setAmount(amount);
        transaction.setPreviousBalance(previousBalance);
        transaction.setCurrentBalance(currentBalance);
        transaction.setTransactionDate(LocalDateTime.now());

        transactionRepository.save(transaction);
    }
}