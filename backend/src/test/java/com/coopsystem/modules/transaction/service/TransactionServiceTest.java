package com.coopsystem.modules.transaction.service;

import com.coopsystem.modules.savings.entity.AccountStatus;
import com.coopsystem.modules.savings.entity.SavingsAccount;
import com.coopsystem.modules.savings.repository.SavingsAccountRepository;
import com.coopsystem.modules.transaction.dto.DepositRequest;
import com.coopsystem.modules.transaction.dto.DepositResponse;
import com.coopsystem.modules.transaction.entity.Transaction;
import com.coopsystem.modules.transaction.entity.TransactionType;
import com.coopsystem.modules.transaction.repository.TransactionRepository;
import com.coopsystem.shared.exception.BusinessException;
import com.coopsystem.testdata.AssociateTestData;
import com.coopsystem.util.ReflectionHelper;
import com.coopsystem.util.TestConstants;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.coopsystem.modules.transaction.dto.WithdrawRequest;
import com.coopsystem.modules.transaction.dto.WithdrawResponse;
import static org.mockito.ArgumentMatchers.any;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private SavingsAccountRepository savingsAccountRepository;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    void shouldDepositSuccessfully() {

        SavingsAccount account = new SavingsAccount();

        ReflectionHelper.setId(account, 1L);

        account.setAccountNumber("100000001");
        account.setBalance(new BigDecimal("500000"));
        account.setStatus(AccountStatus.ACTIVE);
        account.setAssociate(AssociateTestData.validAssociate());
        account.setOpenedAt(LocalDateTime.now());

        DepositRequest request = new DepositRequest();
        request.setAmount(new BigDecimal("200000"));

        when(savingsAccountRepository.findById(1L))
                .thenReturn(Optional.of(account));

        DepositResponse response =
                transactionService.deposit(
                        1L,
                        request);

        assertNotNull(response);

        assertEquals(
                new BigDecimal("700000"),
                response.getCurrentBalance());

        assertEquals(
                new BigDecimal("500000"),
                response.getPreviousBalance());

        assertEquals(
                new BigDecimal("200000"),
                response.getDepositAmount());

        verify(savingsAccountRepository)
                .save(account);

        ArgumentCaptor<Transaction> captor =
                ArgumentCaptor.forClass(Transaction.class);

        verify(transactionRepository)
                .save(captor.capture());

        Transaction transaction =
                captor.getValue();

        assertEquals(
                TransactionType.DEPOSIT,
                transaction.getTransactionType());

        assertEquals(
                new BigDecimal("200000"),
                transaction.getAmount());

        assertEquals(
                new BigDecimal("500000"),
                transaction.getPreviousBalance());

        assertEquals(
                new BigDecimal("700000"),
                transaction.getCurrentBalance());
    }

        @Test
    void shouldWithdrawSuccessfully() {

        SavingsAccount account = new SavingsAccount();

        ReflectionHelper.setId(account, 1L);

        account.setAccountNumber("100000001");
        account.setBalance(new BigDecimal("800000"));
        account.setStatus(AccountStatus.ACTIVE);
        account.setAssociate(AssociateTestData.validAssociate());

        WithdrawRequest request = new WithdrawRequest();
        request.setAmount(new BigDecimal("300000"));

        when(savingsAccountRepository.findById(1L))
                .thenReturn(Optional.of(account));

        WithdrawResponse response =
                transactionService.withdraw(
                        1L,
                        request);

        assertNotNull(response);

        assertEquals(
                new BigDecimal("500000"),
                response.getCurrentBalance());

        verify(savingsAccountRepository)
                .save(account);

        verify(transactionRepository)
                .save(any(Transaction.class));
    }

    @Test
    void shouldThrowExceptionWhenBalanceIsInsufficient() {

        SavingsAccount account = new SavingsAccount();

        ReflectionHelper.setId(account, 1L);

        account.setBalance(new BigDecimal("100000"));
        account.setStatus(AccountStatus.ACTIVE);

        when(savingsAccountRepository.findById(1L))
                .thenReturn(Optional.of(account));

        WithdrawRequest request = new WithdrawRequest();
        request.setAmount(new BigDecimal("500000"));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> transactionService.withdraw(
                                1L,
                                request));

        assertEquals(
                "Saldo insuficiente",
                exception.getMessage());

        verify(transactionRepository, never())
                .save(any());
    }

    @Test
    void shouldThrowExceptionWhenAccountDoesNotExist() {

        when(savingsAccountRepository.findById(1L))
                .thenReturn(Optional.empty());

        DepositRequest request = new DepositRequest();
        request.setAmount(new BigDecimal("100000"));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> transactionService.deposit(
                                1L,
                                request));

        assertEquals(
                "La cuenta de ahorro no existe",
                exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenAccountIsNotActive() {

        SavingsAccount account = new SavingsAccount();

        ReflectionHelper.setId(account, 1L);

        account.setStatus(AccountStatus.BLOCKED);

        when(savingsAccountRepository.findById(1L))
                .thenReturn(Optional.of(account));

        DepositRequest request = new DepositRequest();
        request.setAmount(new BigDecimal("100000"));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> transactionService.deposit(
                                1L,
                                request));

        assertEquals(
                "La cuenta no está activa",
                exception.getMessage());
    }

    @Test
    void shouldDepositLoanSuccessfully() {

        SavingsAccount account = new SavingsAccount();

        ReflectionHelper.setId(account, 1L);

        account.setBalance(new BigDecimal("100000"));
        account.setStatus(AccountStatus.ACTIVE);
        account.setAssociate(AssociateTestData.validAssociate());

        when(savingsAccountRepository.findByAssociateId(
                TestConstants.ASSOCIATE_ID))
                .thenReturn(Optional.of(account));

        transactionService.depositLoan(
                TestConstants.ASSOCIATE_ID,
                new BigDecimal("900000"));

        assertEquals(
                new BigDecimal("1000000"),
                account.getBalance());

        verify(savingsAccountRepository)
                .save(account);

        verify(transactionRepository)
                .save(any(Transaction.class));
    }

    @Test
    void shouldThrowExceptionWhenAssociateHasNoSavingsAccount() {

        when(savingsAccountRepository.findByAssociateId(
                TestConstants.ASSOCIATE_ID))
                .thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> transactionService.depositLoan(
                                TestConstants.ASSOCIATE_ID,
                                new BigDecimal("100000")));

        assertEquals(
                "El asociado no tiene una cuenta de ahorro",
                exception.getMessage());
    }

}