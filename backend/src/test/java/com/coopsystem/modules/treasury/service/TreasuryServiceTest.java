package com.coopsystem.modules.treasury.service;

import com.coopsystem.modules.treasury.dto.request.DepositTreasuryRequest;
import com.coopsystem.modules.treasury.dto.response.TreasuryResponse;
import com.coopsystem.modules.treasury.entity.Treasury;
import com.coopsystem.modules.treasury.repository.TreasuryRepository;
import com.coopsystem.shared.exception.BusinessException;
import com.coopsystem.util.ReflectionHelper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import com.coopsystem.modules.treasury.dto.request.WithdrawTreasuryRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TreasuryServiceTest {

    private static final String MAIN_TREASURY = "Caja General";

    @Mock
    private TreasuryRepository treasuryRepository;

    @InjectMocks
    private TreasuryService treasuryService;

    @Test
    void shouldFindTreasurySuccessfully() {

        Treasury treasury = new Treasury();

        ReflectionHelper.setId(treasury, 1L);

        treasury.setName(MAIN_TREASURY);
        treasury.setBalance(new BigDecimal("5000000"));
        treasury.setCreatedAt(LocalDateTime.now());

        when(treasuryRepository.findByName(MAIN_TREASURY))
                .thenReturn(Optional.of(treasury));

        TreasuryResponse response =
                treasuryService.findTreasury();

        assertNotNull(response);

        assertEquals(
                1L,
                response.getId());

        assertEquals(
                MAIN_TREASURY,
                response.getName());

        assertEquals(
                new BigDecimal("5000000"),
                response.getBalance());

        verify(treasuryRepository)
                .findByName(MAIN_TREASURY);
    }

    @Test
    void shouldDepositSuccessfully() {

        Treasury treasury = new Treasury();

        ReflectionHelper.setId(treasury, 1L);

        treasury.setName(MAIN_TREASURY);
        treasury.setBalance(new BigDecimal("5000000"));
        treasury.setCreatedAt(LocalDateTime.now());

        when(treasuryRepository.findByName(MAIN_TREASURY))
                .thenReturn(Optional.of(treasury));

        when(treasuryRepository.save(any(Treasury.class)))
                .thenReturn(treasury);

        DepositTreasuryRequest request =
                new DepositTreasuryRequest(
                        new BigDecimal("1000000"));

        TreasuryResponse response =
                treasuryService.deposit(request);

        assertEquals(
                new BigDecimal("6000000"),
                response.getBalance());

        ArgumentCaptor<Treasury> captor =
                ArgumentCaptor.forClass(Treasury.class);

        verify(treasuryRepository)
                .save(captor.capture());

        assertEquals(
                new BigDecimal("6000000"),
                captor.getValue().getBalance());
    }

        @Test
    void shouldWithdrawSuccessfully() {

        Treasury treasury = new Treasury();

        ReflectionHelper.setId(treasury, 1L);

        treasury.setName(MAIN_TREASURY);
        treasury.setBalance(new BigDecimal("5000000"));
        treasury.setCreatedAt(LocalDateTime.now());

        when(treasuryRepository.findByName(MAIN_TREASURY))
                .thenReturn(Optional.of(treasury));

        when(treasuryRepository.save(any(Treasury.class)))
                .thenReturn(treasury);

        WithdrawTreasuryRequest request =
                new WithdrawTreasuryRequest();

        request.setAmount(
                new BigDecimal("1000000"));

        TreasuryResponse response =
                treasuryService.withdraw(request);

        assertEquals(
                new BigDecimal("4000000"),
                response.getBalance());

        verify(treasuryRepository)
                .save(any(Treasury.class));
    }

    @Test
    void shouldThrowExceptionWhenTreasuryDoesNotExist() {

        when(treasuryRepository.findByName(MAIN_TREASURY))
                .thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> treasuryService.findTreasury());

        assertEquals(
                "La Caja General no existe",
                exception.getMessage());

        verify(treasuryRepository)
                .findByName(MAIN_TREASURY);

        verifyNoMoreInteractions(
                treasuryRepository);
    }

    @Test
    void shouldThrowExceptionWhenWithdrawHasInsufficientFunds() {

        Treasury treasury = new Treasury();

        treasury.setName(MAIN_TREASURY);
        treasury.setBalance(new BigDecimal("500000"));

        when(treasuryRepository.findByName(MAIN_TREASURY))
                .thenReturn(Optional.of(treasury));

        WithdrawTreasuryRequest request =
                new WithdrawTreasuryRequest();

        request.setAmount(
                new BigDecimal("1000000"));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> treasuryService.withdraw(request));

        assertEquals(
                "Fondos insuficientes en la caja de la cooperativa",
                exception.getMessage());

        verify(treasuryRepository, never())
                .save(any());
    }

    @Test
    void shouldWithdrawLoanSuccessfully() {

        Treasury treasury = new Treasury();

        treasury.setName(MAIN_TREASURY);
        treasury.setBalance(new BigDecimal("5000000"));

        when(treasuryRepository.findByName(MAIN_TREASURY))
                .thenReturn(Optional.of(treasury));

        treasuryService.withdrawLoan(
                new BigDecimal("1000000"));

        assertEquals(
                new BigDecimal("4000000"),
                treasury.getBalance());

        verify(treasuryRepository)
                .save(any(Treasury.class));
    }

    @Test
    void shouldThrowExceptionWhenTreasuryHasInsufficientFundsForLoan() {

        Treasury treasury = new Treasury();

        treasury.setName(MAIN_TREASURY);
        treasury.setBalance(new BigDecimal("500000"));

        when(treasuryRepository.findByName(MAIN_TREASURY))
                .thenReturn(Optional.of(treasury));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> treasuryService.withdrawLoan(
                                new BigDecimal("1000000")));

        assertEquals(
                "La cooperativa no tiene fondos suficientes para desembolsar el préstamo",
                exception.getMessage());

        verify(treasuryRepository, never())
                .save(any());
    }

}