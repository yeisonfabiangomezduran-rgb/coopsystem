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
import com.coopsystem.util.ReflectionHelper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.ArgumentMatchers.any;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SavingsAccountServiceTest {

    @Mock
    private SavingsAccountRepository savingsAccountRepository;

    @Mock
    private AssociateRepository associateRepository;

    @InjectMocks
    private SavingsAccountService savingsAccountService;

    @Test
    void shouldFindAllAccountsSuccessfully() {

        Associate associate = new Associate();
        ReflectionHelper.setId(associate, 1L);

        SavingsAccount account = new SavingsAccount();
        ReflectionHelper.setId(account, 1L);

        account.setAssociate(associate);
        account.setAccountNumber("100000001");
        account.setBalance(BigDecimal.ZERO);
        account.setStatus(AccountStatus.ACTIVE);
        account.setOpenedAt(LocalDateTime.now());

        when(savingsAccountRepository.findAll())
                .thenReturn(List.of(account));

        List<SavingsAccountResponse> response =
                savingsAccountService.findAll();

        assertEquals(1, response.size());

        assertEquals(
                "100000001",
                response.get(0).getAccountNumber());

        verify(savingsAccountRepository)
                .findAll();
    }

    @Test
    void shouldFindAccountByIdSuccessfully() {

        Associate associate = new Associate();
        ReflectionHelper.setId(associate, 1L);

        SavingsAccount account = new SavingsAccount();
        ReflectionHelper.setId(account, 1L);

        account.setAssociate(associate);
        account.setAccountNumber("100000001");
        account.setBalance(BigDecimal.ZERO);
        account.setStatus(AccountStatus.ACTIVE);
        account.setOpenedAt(LocalDateTime.now());

        when(savingsAccountRepository.findById(1L))
                .thenReturn(Optional.of(account));

        SavingsAccountResponse response =
                savingsAccountService.findById(1L);

        assertEquals(
                "100000001",
                response.getAccountNumber());

        verify(savingsAccountRepository)
                .findById(1L);
    }

    @Test
    void shouldThrowExceptionWhenAccountDoesNotExist() {

        when(savingsAccountRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(
                BusinessException.class,
                () -> savingsAccountService.findById(1L));

        verify(savingsAccountRepository)
                .findById(1L);
    }

    @Test
    void shouldFindAccountByNumberSuccessfully() {

        Associate associate = new Associate();
        ReflectionHelper.setId(associate, 1L);

        SavingsAccount account = new SavingsAccount();
        ReflectionHelper.setId(account, 1L);

        account.setAssociate(associate);
        account.setAccountNumber("100000001");
        account.setBalance(BigDecimal.ZERO);
        account.setStatus(AccountStatus.ACTIVE);
        account.setOpenedAt(LocalDateTime.now());

        when(savingsAccountRepository.findByAccountNumber("100000001"))
                .thenReturn(Optional.of(account));

        SavingsAccountResponse response =
                savingsAccountService.findByAccountNumber("100000001");

        assertEquals(
                "100000001",
                response.getAccountNumber());

        verify(savingsAccountRepository)
                .findByAccountNumber("100000001");
    }

    @Test
    void shouldUpdateAccountStatusSuccessfully() {

        Associate associate = new Associate();
        ReflectionHelper.setId(associate, 1L);

        SavingsAccount account = new SavingsAccount();
        ReflectionHelper.setId(account, 1L);
        account.setAssociate(associate);
        account.setAccountNumber("100000001");
        account.setBalance(BigDecimal.ZERO);
        account.setStatus(AccountStatus.ACTIVE);
        account.setOpenedAt(LocalDateTime.now());

        UpdateSavingsAccountStatusRequest request =
                new UpdateSavingsAccountStatusRequest();
        request.setStatus(AccountStatus.BLOCKED);

        when(savingsAccountRepository.findById(1L))
                .thenReturn(Optional.of(account));
        when(savingsAccountRepository.save(account))
                .thenReturn(account);

        SavingsAccountResponse response =
                savingsAccountService.updateStatus(1L, request);

        assertEquals("BLOCKED", response.getStatus());
        verify(savingsAccountRepository).save(account);
    }

        @Test
    void shouldCreateSavingsAccountSuccessfully() {

        CreateSavingsAccountRequest request =
                new CreateSavingsAccountRequest();

        request.setAssociateId(1L);

        Associate associate = new Associate();
        ReflectionHelper.setId(associate, 1L);

        when(savingsAccountRepository.existsByAssociateId(1L))
                .thenReturn(false);

        when(associateRepository.findById(1L))
                .thenReturn(Optional.of(associate));

        when(savingsAccountRepository.count())
                .thenReturn(0L);

        SavingsAccount saved = new SavingsAccount();
        ReflectionHelper.setId(saved, 1L);

        saved.setAssociate(associate);
        saved.setAccountNumber("100000001");
        saved.setBalance(BigDecimal.ZERO);
        saved.setStatus(AccountStatus.ACTIVE);
        saved.setOpenedAt(LocalDateTime.now());

        when(savingsAccountRepository.save(any(SavingsAccount.class)))
                .thenReturn(saved);

        SavingsAccountResponse response =
                savingsAccountService.create(request);

        assertNotNull(response);

        assertEquals(
                "100000001",
                response.getAccountNumber());

        ArgumentCaptor<SavingsAccount> captor =
                ArgumentCaptor.forClass(SavingsAccount.class);

        verify(savingsAccountRepository)
                .save(captor.capture());

        assertEquals(
                AccountStatus.ACTIVE,
                captor.getValue().getStatus());

        assertEquals(
                BigDecimal.ZERO,
                captor.getValue().getBalance());
    }

    @Test
    void shouldThrowExceptionWhenAssociateAlreadyHasAccount() {

        CreateSavingsAccountRequest request =
                new CreateSavingsAccountRequest();

        request.setAssociateId(1L);

        when(savingsAccountRepository.existsByAssociateId(1L))
                .thenReturn(true);

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> savingsAccountService.create(request));

        assertEquals(
                "El asociado ya tiene una cuenta de ahorro",
                exception.getMessage());

        verify(savingsAccountRepository, never())
                .save(any());
    }

    @Test
    void shouldThrowExceptionWhenAssociateDoesNotExist() {

        CreateSavingsAccountRequest request =
                new CreateSavingsAccountRequest();

        request.setAssociateId(1L);

        when(savingsAccountRepository.existsByAssociateId(1L))
                .thenReturn(false);

        when(associateRepository.findById(1L))
                .thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> savingsAccountService.create(request));

        assertEquals(
                "El asociado no existe",
                exception.getMessage());

        verify(savingsAccountRepository, never())
                .save(any());
    }

}
