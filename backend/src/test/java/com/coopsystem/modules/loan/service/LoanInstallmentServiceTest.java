package com.coopsystem.modules.loan.service;

import com.coopsystem.modules.loan.amortization.dto.AmortizationSchedule;
import com.coopsystem.modules.loan.amortization.dto.InstallmentCalculation;
import com.coopsystem.modules.loan.amortization.strategy.AmortizationStrategy;
import com.coopsystem.modules.loan.dto.response.LoanInstallmentResponse;
import com.coopsystem.modules.loan.entity.InstallmentStatus;
import com.coopsystem.modules.loan.entity.Loan;
import com.coopsystem.modules.loan.entity.LoanInstallment;
import com.coopsystem.modules.loan.entity.LoanStatus;
import com.coopsystem.modules.loan.repository.LoanInstallmentRepository;
import com.coopsystem.modules.loan.repository.LoanRepository;
import com.coopsystem.shared.exception.BusinessException;
import com.coopsystem.testdata.LoanTestData;
import com.coopsystem.util.TestConstants;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoanInstallmentServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private LoanInstallmentRepository loanInstallmentRepository;

    @Mock
    private AmortizationStrategy amortizationStrategy;

    @InjectMocks
    private LoanInstallmentService loanInstallmentService;

    @Test
    void shouldGenerateScheduleSuccessfully() {

        Loan loan = LoanTestData.disbursedLoan();

        InstallmentCalculation calculation =
                new InstallmentCalculation(
                        1,
                        LocalDate.now().plusMonths(1),
                        new BigDecimal("900000"),
                        new BigDecimal("100000"),
                        new BigDecimal("1000000"),
                        BigDecimal.ZERO
                );

        AmortizationSchedule schedule =
                new AmortizationSchedule();

        schedule.setInstallments(List.of(calculation));

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        when(loanInstallmentRepository
                .findByLoanIdOrderByInstallmentNumberAsc(TestConstants.LOAN_ID))
                .thenReturn(List.of());

        when(amortizationStrategy.generateSchedule(loan))
                .thenReturn(schedule);

        loanInstallmentService.generateSchedule(TestConstants.LOAN_ID);

        ArgumentCaptor<List<LoanInstallment>> captor =
                ArgumentCaptor.forClass(List.class);

        verify(loanInstallmentRepository)
                .saveAll(captor.capture());

        List<LoanInstallment> installments =
                captor.getValue();

        assertEquals(1, installments.size());

        LoanInstallment installment =
                installments.get(0);

        assertEquals(1, installment.getInstallmentNumber());
        assertEquals(InstallmentStatus.PENDING, installment.getStatus());
        assertEquals(new BigDecimal("900000"), installment.getPrincipal());
        assertEquals(new BigDecimal("100000"), installment.getInterest());

        verify(amortizationStrategy)
                .generateSchedule(loan);
    }

        @Test
    void shouldThrowExceptionWhenLoanDoesNotExist() {

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanInstallmentService.generateSchedule(
                                TestConstants.LOAN_ID));

        assertEquals(
                "El préstamo no existe",
                exception.getMessage());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);

        verifyNoInteractions(
                loanInstallmentRepository,
                amortizationStrategy);
    }

    @Test
    void shouldThrowExceptionWhenLoanIsNotDisbursed() {

        Loan loan = LoanTestData.pendingLoan();

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanInstallmentService.generateSchedule(
                                TestConstants.LOAN_ID));

        assertEquals(
                "El cronograma solo puede generarse para préstamos desembolsados",
                exception.getMessage());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);

        verifyNoInteractions(
                loanInstallmentRepository,
                amortizationStrategy);
    }

    @Test
    void shouldThrowExceptionWhenScheduleAlreadyExists() {

        Loan loan = LoanTestData.disbursedLoan();

        LoanInstallment installment =
                new LoanInstallment();

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        when(loanInstallmentRepository
                .findByLoanIdOrderByInstallmentNumberAsc(
                        TestConstants.LOAN_ID))
                .thenReturn(List.of(installment));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanInstallmentService.generateSchedule(
                                TestConstants.LOAN_ID));

        assertEquals(
                "El préstamo ya tiene un cronograma generado",
                exception.getMessage());

        verify(loanInstallmentRepository)
                .findByLoanIdOrderByInstallmentNumberAsc(
                        TestConstants.LOAN_ID);

        verify(amortizationStrategy, never())
                .generateSchedule(any());
    }

    @Test
    void shouldFindInstallmentsSuccessfully() {

        Loan loan = LoanTestData.disbursedLoan();

        LoanInstallment installment =
                new LoanInstallment();

        installment.setLoan(loan);
        installment.setInstallmentNumber(1);
        installment.setDueDate(LocalDate.now().plusMonths(1));
        installment.setPrincipal(new BigDecimal("900000"));
        installment.setInterest(new BigDecimal("100000"));
        installment.setTotalPayment(new BigDecimal("1000000"));
        installment.setRemainingBalance(BigDecimal.ZERO);
        installment.setStatus(InstallmentStatus.PENDING);

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        when(loanInstallmentRepository
                .findByLoanIdOrderByInstallmentNumberAsc(
                        TestConstants.LOAN_ID))
                .thenReturn(List.of(installment));

        List<LoanInstallmentResponse> response =
                loanInstallmentService.findByLoan(
                        TestConstants.LOAN_ID);

        assertNotNull(response);
        assertEquals(1, response.size());

        assertEquals(
                1,
                response.get(0).getInstallmentNumber());

        assertEquals(
                InstallmentStatus.PENDING.name(),
                response.get(0).getStatus());

        verify(loanInstallmentRepository)
                .findByLoanIdOrderByInstallmentNumberAsc(
                        TestConstants.LOAN_ID);
    }

    @Test
    void shouldReturnEmptyInstallmentList() {

        Loan loan = LoanTestData.disbursedLoan();

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        when(loanInstallmentRepository
                .findByLoanIdOrderByInstallmentNumberAsc(
                        TestConstants.LOAN_ID))
                .thenReturn(List.of());

        List<LoanInstallmentResponse> response =
                loanInstallmentService.findByLoan(
                        TestConstants.LOAN_ID);

        assertNotNull(response);
        assertTrue(response.isEmpty());

        verify(loanInstallmentRepository)
                .findByLoanIdOrderByInstallmentNumberAsc(
                        TestConstants.LOAN_ID);
    }

    @Test
    void shouldThrowExceptionWhenFindingInstallmentsForUnknownLoan() {

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanInstallmentService.findByLoan(
                                TestConstants.LOAN_ID));

        assertEquals(
                "El préstamo no existe",
                exception.getMessage());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);
    }

}