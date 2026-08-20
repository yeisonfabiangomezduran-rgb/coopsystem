package com.coopsystem.modules.transaction.service;

import com.coopsystem.modules.loan.entity.Loan;
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

    /**
     * Realiza una consignación en una cuenta de ahorro.
     */
    @Transactional
    public DepositResponse deposit(
            Long savingsAccountId,
            DepositRequest request) {

        SavingsAccount account =
                getActiveAccount(savingsAccountId);

        BigDecimal previousBalance =
                account.getBalance();

        BigDecimal currentBalance =
                previousBalance.add(request.getAmount());

        account.setBalance(currentBalance);

        savingsAccountRepository.save(account);

        saveTransaction(
                account,
                null,
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

    /**
     * Realiza un retiro de una cuenta de ahorro.
     */
    @Transactional
    public WithdrawResponse withdraw(
            Long savingsAccountId,
            WithdrawRequest request) {

        SavingsAccount account =
                getActiveAccount(savingsAccountId);

        BigDecimal previousBalance =
                account.getBalance();

        if (previousBalance.compareTo(
                request.getAmount()) < 0) {

            throw new BusinessException(
                    "Saldo insuficiente");
        }

        BigDecimal currentBalance =
                previousBalance.subtract(
                        request.getAmount());

        account.setBalance(currentBalance);

        savingsAccountRepository.save(account);

        saveTransaction(
                account,
                null,
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

    /**
     * Obtiene el historial de transacciones de una cuenta.
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> findTransactions(
            Long savingsAccountId) {

        getAccount(savingsAccountId);

        return transactionRepository
                .findBySavingsAccountIdOrderByTransactionDateDesc(
                        savingsAccountId)
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
     * Registra el desembolso de un préstamo y deposita
     * el dinero en la cuenta de ahorro del asociado.
     *
     * Esta versión permite relacionar la transacción
     * directamente con el préstamo.
     */
    @Transactional
    public void depositLoan(
            Long associateId,
            BigDecimal amount,
            Loan loan) {

        SavingsAccount account =
                getActiveAssociateAccount(associateId);

        BigDecimal previousBalance =
                account.getBalance();

        BigDecimal currentBalance =
                previousBalance.add(amount);

        account.setBalance(currentBalance);

        savingsAccountRepository.save(account);

        saveTransaction(
                account,
                loan,
                TransactionType.LOAN_DISBURSEMENT,
                amount,
                previousBalance,
                currentBalance
        );
    }

    /**
     * Registra un desembolso de préstamo sin asociarlo
     * explícitamente a una entidad Loan.
     *
     * Se mantiene para compatibilidad con código y pruebas
     * existentes que utilizan la firma anterior.
     */
    @Transactional
    public void depositLoan(
            Long associateId,
            BigDecimal amount) {

        SavingsAccount account =
                getActiveAssociateAccount(associateId);

        BigDecimal previousBalance =
                account.getBalance();

        BigDecimal currentBalance =
                previousBalance.add(amount);

        account.setBalance(currentBalance);

        savingsAccountRepository.save(account);

        saveTransaction(
                account,
                null,
                TransactionType.LOAN_DISBURSEMENT,
                amount,
                previousBalance,
                currentBalance
        );
    }

    /**
     * Registra un pago de préstamo.
     *
     * El pago no modifica el saldo de la cuenta de ahorro.
     * Solamente registra el movimiento asociado al préstamo.
     */
    @Transactional
    public void recordLoanPayment(
            Loan loan,
            BigDecimal amount) {

        if (loan == null) {

            throw new BusinessException(
                    "El préstamo es obligatorio para registrar el pago");
        }

        if (amount == null ||
                amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new BusinessException(
                    "El valor del pago debe ser mayor que cero");
        }

        saveTransaction(
                null,
                loan,
                TransactionType.LOAN_PAYMENT,
                amount,
                BigDecimal.ZERO,
                BigDecimal.ZERO
        );
    }

    /**
     * Obtiene las transacciones asociadas a un préstamo.
     */
    @Transactional(readOnly = true)
    public List<TransactionResponse> findLoanTransactions(
            Long loanId) {

        return transactionRepository
                .findByLoanIdOrderByTransactionDateDesc(
                        loanId)
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
     * Obtiene una cuenta de ahorro por ID.
     */
    private SavingsAccount getAccount(
            Long savingsAccountId) {

        return savingsAccountRepository
                .findById(savingsAccountId)
                .orElseThrow(() ->
                        new BusinessException(
                                "La cuenta de ahorro no existe"));
    }

    /**
     * Obtiene una cuenta y valida que esté activa.
     */
    private SavingsAccount getActiveAccount(
            Long savingsAccountId) {

        SavingsAccount account =
                getAccount(savingsAccountId);

        if (account.getStatus() != AccountStatus.ACTIVE) {

            throw new BusinessException(
                    "La cuenta no está activa");
        }

        return account;
    }

    /**
     * Obtiene la cuenta activa de un asociado.
     */
    private SavingsAccount getActiveAssociateAccount(
            Long associateId) {

        SavingsAccount account =
                savingsAccountRepository
                        .findByAssociateId(associateId)
                        .orElseThrow(() ->
                                new BusinessException(
                                        "El asociado no tiene una cuenta de ahorro"));

        if (account.getStatus() != AccountStatus.ACTIVE) {

            throw new BusinessException(
                    "La cuenta de ahorro no está activa");
        }

        return account;
    }

    /**
     * Registra una transacción financiera.
     *
     * La cuenta de ahorro puede ser null para movimientos
     * que pertenecen exclusivamente al préstamo, como
     * LOAN_PAYMENT.
     */
    private void saveTransaction(
            SavingsAccount account,
            Loan loan,
            TransactionType transactionType,
            BigDecimal amount,
            BigDecimal previousBalance,
            BigDecimal currentBalance) {

        Transaction transaction =
                new Transaction();

        transaction.setSavingsAccount(account);
        transaction.setLoan(loan);
        transaction.setTransactionType(transactionType);
        transaction.setAmount(amount);
        transaction.setPreviousBalance(previousBalance);
        transaction.setCurrentBalance(currentBalance);
        transaction.setTransactionDate(
                LocalDateTime.now());

        transactionRepository.save(transaction);
    }
}