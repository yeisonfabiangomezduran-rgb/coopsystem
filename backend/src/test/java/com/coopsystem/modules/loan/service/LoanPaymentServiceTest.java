package com.coopsystem.modules.loan.service;

import com.coopsystem.modules.loan.dto.request.LoanPaymentRequest;
import com.coopsystem.modules.loan.dto.response.LoanPaymentResponse;
import com.coopsystem.modules.loan.entity.InstallmentStatus;
import com.coopsystem.modules.loan.entity.Loan;
import com.coopsystem.modules.loan.entity.LoanInstallment;
import com.coopsystem.modules.loan.entity.LoanStatus;
import com.coopsystem.modules.loan.repository.LoanInstallmentRepository;
import com.coopsystem.modules.loan.repository.LoanRepository;
import com.coopsystem.modules.treasury.service.TreasuryService;
import com.coopsystem.shared.exception.BusinessException;
import com.coopsystem.testdata.LoanTestData;
import com.coopsystem.util.ReflectionHelper;
import com.coopsystem.util.TestConstants;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoanPaymentServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private LoanInstallmentRepository loanInstallmentRepository;

    @Mock
    private TreasuryService treasuryService;

    @InjectMocks
    private LoanPaymentService loanPaymentService;

    @Test
    void shouldPayInstallmentSuccessfully() {

        Loan loan = LoanTestData.disbursedLoan();

        LoanInstallment installment = new LoanInstallment();

        ReflectionHelper.setId(installment, 1L);

        installment.setLoan(loan);
        installment.setInstallmentNumber(1);
        installment.setDueDate(LocalDate.now());
        installment.setPrincipal(new BigDecimal("900000"));
        installment.setInterest(new BigDecimal("100000"));
        installment.setTotalPayment(new BigDecimal("1000000"));
        installment.setRemainingBalance(BigDecimal.ZERO);
        installment.setStatus(InstallmentStatus.PENDING);

        LoanPaymentRequest request =
                new LoanPaymentRequest(
                        new BigDecimal("1000000"));

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        when(loanInstallmentRepository
                .findFirstByLoanIdAndStatusOrderByInstallmentNumberAsc(
                        TestConstants.LOAN_ID,
                        InstallmentStatus.PENDING))
                .thenReturn(Optional.of(installment));

        when(loanInstallmentRepository.countByLoanIdAndStatus(
                TestConstants.LOAN_ID,
                InstallmentStatus.PENDING))
                .thenReturn(1L);

        LoanPaymentResponse response =
                loanPaymentService.pay(
                        TestConstants.LOAN_ID,
                        request);

        assertNotNull(response);

        assertEquals(
                TestConstants.LOAN_NUMBER,
                response.getLoanNumber());

        assertEquals(
                1,
                response.getInstallmentNumber());

        assertEquals(
                new BigDecimal("1000000"),
                response.getAmountPaid());

        assertEquals(
                1,
                response.getRemainingInstallments());

        assertEquals(
                LoanStatus.DISBURSED.name(),
                response.getLoanStatus());

        verify(loanInstallmentRepository)
                .save(any(LoanInstallment.class));

        verify(treasuryService)
                .deposit(any());
    }

        @Test
    void shouldCancelLoanWhenLastInstallmentIsPaid() {

        Loan loan = LoanTestData.disbursedLoan();

        LoanInstallment installment = new LoanInstallment();

        ReflectionHelper.setId(installment, 1L);

        installment.setLoan(loan);
        installment.setInstallmentNumber(12);
        installment.setDueDate(LocalDate.now());
        installment.setPrincipal(new BigDecimal("900000"));
        installment.setInterest(new BigDecimal("100000"));
        installment.setTotalPayment(new BigDecimal("1000000"));
        installment.setRemainingBalance(BigDecimal.ZERO);
        installment.setStatus(InstallmentStatus.PENDING);

        LoanPaymentRequest request =
                new LoanPaymentRequest(new BigDecimal("1000000"));

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        when(loanInstallmentRepository
                .findFirstByLoanIdAndStatusOrderByInstallmentNumberAsc(
                        TestConstants.LOAN_ID,
                        InstallmentStatus.PENDING))
                .thenReturn(Optional.of(installment));

        when(loanInstallmentRepository.countByLoanIdAndStatus(
                TestConstants.LOAN_ID,
                InstallmentStatus.PENDING))
                .thenReturn(0L);

        LoanPaymentResponse response =
                loanPaymentService.pay(
                        TestConstants.LOAN_ID,
                        request);

        assertEquals(
                LoanStatus.CANCELLED.name(),
                response.getLoanStatus());

        verify(loanRepository)
                .save(loan);
    }

    @Test
    void shouldThrowExceptionWhenLoanDoesNotExist() {

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.empty());

        LoanPaymentRequest request =
                new LoanPaymentRequest(new BigDecimal("1000000"));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanPaymentService.pay(
                                TestConstants.LOAN_ID,
                                request));

        assertEquals(
                "El préstamo no existe",
                exception.getMessage());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);

        verifyNoInteractions(
                loanInstallmentRepository,
                treasuryService);
    }

    @Test
    void shouldThrowExceptionWhenLoanIsNotDisbursed() {

        Loan loan = LoanTestData.pendingLoan();

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        LoanPaymentRequest request =
                new LoanPaymentRequest(new BigDecimal("1000000"));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanPaymentService.pay(
                                TestConstants.LOAN_ID,
                                request));

        assertEquals(
                "Solo se pueden pagar préstamos desembolsados",
                exception.getMessage());

        verifyNoInteractions(
                loanInstallmentRepository,
                treasuryService);
    }

    @Test
    void shouldThrowExceptionWhenLoanHasNoPendingInstallments() {

        Loan loan = LoanTestData.disbursedLoan();

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        when(loanInstallmentRepository
                .findFirstByLoanIdAndStatusOrderByInstallmentNumberAsc(
                        TestConstants.LOAN_ID,
                        InstallmentStatus.PENDING))
                .thenReturn(Optional.empty());

        LoanPaymentRequest request =
                new LoanPaymentRequest(new BigDecimal("1000000"));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanPaymentService.pay(
                                TestConstants.LOAN_ID,
                                request));

        assertEquals(
                "El préstamo no tiene cuotas pendientes",
                exception.getMessage());
    }

    @Test
    void shouldThrowExceptionWhenAmountIsIncorrect() {

        Loan loan = LoanTestData.disbursedLoan();

        LoanInstallment installment = new LoanInstallment();

        installment.setLoan(loan);
        installment.setInstallmentNumber(1);
        installment.setTotalPayment(new BigDecimal("1000000"));
        installment.setStatus(InstallmentStatus.PENDING);

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        when(loanInstallmentRepository
                .findFirstByLoanIdAndStatusOrderByInstallmentNumberAsc(
                        TestConstants.LOAN_ID,
                        InstallmentStatus.PENDING))
                .thenReturn(Optional.of(installment));

        LoanPaymentRequest request =
                new LoanPaymentRequest(new BigDecimal("500000"));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanPaymentService.pay(
                                TestConstants.LOAN_ID,
                                request));

        assertEquals(
                "El valor pagado no corresponde al valor de la cuota",
                exception.getMessage());

        verify(treasuryService, never())
                .deposit(any());
    }

}