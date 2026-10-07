package com.coopsystem.modules.loan.service;

import com.coopsystem.modules.associate.entity.Associate;
import com.coopsystem.modules.associate.repository.AssociateRepository;
import com.coopsystem.modules.loan.dto.request.CreateLoanRequest;
import com.coopsystem.modules.loan.dto.response.LoanResponse;
import com.coopsystem.modules.loan.entity.Loan;
import com.coopsystem.modules.loan.entity.LoanStatus;
import com.coopsystem.modules.loan.repository.LoanRepository;
import com.coopsystem.modules.savingsfund.service.SavingsFundMonthlyService;
import com.coopsystem.modules.transaction.service.TransactionService;
import com.coopsystem.shared.exception.BusinessException;
import com.coopsystem.testdata.AssociateTestData;
import com.coopsystem.testdata.LoanTestData;
import com.coopsystem.util.TestConstants;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Mock
    private LoanRepository loanRepository;

    @Mock
    private AssociateRepository associateRepository;

    @Mock
    private TransactionService transactionService;

    @Mock
    private LoanInstallmentService loanInstallmentService;

    @Mock
    private SavingsFundMonthlyService savingsFundMonthlyService;

    @InjectMocks
    private LoanService loanService;

    @Test
    void shouldCreateLoanSuccessfully() {

        CreateLoanRequest request = new CreateLoanRequest();

        request.setAssociateId(TestConstants.ASSOCIATE_ID);
        request.setAmount(TestConstants.LOAN_AMOUNT);
        request.setInterestRate(TestConstants.INTEREST_RATE);
        request.setTermMonths(TestConstants.TERM_MONTHS);

        Loan savedLoan = LoanTestData.pendingLoan();

        when(associateRepository.findById(TestConstants.ASSOCIATE_ID))
                .thenReturn(Optional.of(AssociateTestData.validAssociate()));

        when(loanRepository.count())
                .thenReturn(0L);

        when(loanRepository.save(any(Loan.class)))
                .thenReturn(savedLoan);

        LoanResponse response = loanService.create(request);

        assertNotNull(response);
        assertEquals(TestConstants.LOAN_ID, response.getId());
        assertEquals(TestConstants.LOAN_NUMBER, response.getLoanNumber());
        assertEquals(TestConstants.ASSOCIATE_ID, response.getAssociateId());
        assertEquals(TestConstants.LOAN_AMOUNT, response.getAmount());
        assertEquals(TestConstants.INTEREST_RATE, response.getInterestRate());
        assertEquals(TestConstants.TERM_MONTHS, response.getTermMonths());
        assertEquals(LoanStatus.PENDING.name(), response.getStatus());

        ArgumentCaptor<Loan> captor =
                ArgumentCaptor.forClass(Loan.class);

        verify(loanRepository).save(captor.capture());

        Loan loan = captor.getValue();

        assertEquals(TestConstants.LOAN_AMOUNT, loan.getAmount());
        assertEquals(TestConstants.INTEREST_RATE, loan.getInterestRate());
        assertEquals(TestConstants.TERM_MONTHS, loan.getTermMonths());
        assertEquals(LoanStatus.PENDING, loan.getStatus());

        verify(associateRepository)
                .findById(TestConstants.ASSOCIATE_ID);

        verify(loanRepository).count();
        verify(loanRepository).save(any(Loan.class));

        verifyNoInteractions(
                transactionService,
                loanInstallmentService,
                savingsFundMonthlyService
        );
    }

    @Test
    void shouldThrowExceptionWhenAssociateDoesNotExist() {

        CreateLoanRequest request = new CreateLoanRequest();

        request.setAssociateId(TestConstants.ASSOCIATE_ID);
        request.setAmount(TestConstants.LOAN_AMOUNT);
        request.setInterestRate(TestConstants.INTEREST_RATE);
        request.setTermMonths(TestConstants.TERM_MONTHS);

        when(associateRepository.findById(TestConstants.ASSOCIATE_ID))
                .thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanService.create(request));

        assertEquals(
                "El asociado no existe",
                exception.getMessage());

        verify(associateRepository)
                .findById(TestConstants.ASSOCIATE_ID);

        verifyNoInteractions(
                loanRepository,
                transactionService,
                loanInstallmentService,
                savingsFundMonthlyService
        );
    }

    @Test
    void shouldFindLoanByIdSuccessfully() {

        Loan loan = LoanTestData.pendingLoan();

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        LoanResponse response =
                loanService.findById(TestConstants.LOAN_ID);

        assertNotNull(response);
        assertEquals(TestConstants.LOAN_ID, response.getId());
        assertEquals(TestConstants.LOAN_NUMBER, response.getLoanNumber());
        assertEquals(TestConstants.ASSOCIATE_ID, response.getAssociateId());
        assertEquals(TestConstants.LOAN_AMOUNT, response.getAmount());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);

        verifyNoInteractions(
                associateRepository,
                transactionService,
                loanInstallmentService,
                savingsFundMonthlyService
        );
    }

    @Test
    void shouldThrowExceptionWhenLoanDoesNotExistById() {

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanService.findById(TestConstants.LOAN_ID));

        assertEquals(
                "El préstamo no existe",
                exception.getMessage());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);
    }

    @Test
    void shouldFindLoanByLoanNumberSuccessfully() {

        Loan loan = LoanTestData.pendingLoan();

        when(loanRepository.findByLoanNumber(TestConstants.LOAN_NUMBER))
                .thenReturn(Optional.of(loan));

        LoanResponse response =
                loanService.findByLoanNumber(
                        TestConstants.LOAN_NUMBER);

        assertNotNull(response);

        assertEquals(
                TestConstants.LOAN_NUMBER,
                response.getLoanNumber());

        verify(loanRepository)
                .findByLoanNumber(TestConstants.LOAN_NUMBER);

        verifyNoInteractions(
                associateRepository,
                transactionService,
                loanInstallmentService,
                savingsFundMonthlyService
        );
    }

    @Test
    void shouldThrowExceptionWhenLoanNumberDoesNotExist() {

        when(loanRepository.findByLoanNumber(TestConstants.LOAN_NUMBER))
                .thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanService.findByLoanNumber(
                                TestConstants.LOAN_NUMBER));

        assertEquals(
                "El préstamo no existe",
                exception.getMessage());

        verify(loanRepository)
                .findByLoanNumber(TestConstants.LOAN_NUMBER);
    }

    @Test
    void shouldFindAllLoansSuccessfully() {

        Loan pendingLoan = LoanTestData.pendingLoan();
        Loan approvedLoan = LoanTestData.approvedLoan();

        when(loanRepository.findAll())
                .thenReturn(
                        java.util.List.of(
                                pendingLoan,
                                approvedLoan));

        java.util.List<LoanResponse> responses =
                loanService.findAll();

        assertNotNull(responses);
        assertEquals(2, responses.size());

        assertEquals(
                LoanStatus.PENDING.name(),
                responses.get(0).getStatus());

        assertEquals(
                LoanStatus.APPROVED.name(),
                responses.get(1).getStatus());

        verify(loanRepository).findAll();

        verifyNoInteractions(
                associateRepository,
                transactionService,
                loanInstallmentService,
                savingsFundMonthlyService
        );
    }

    @Test
    void shouldReturnEmptyListWhenNoLoansExist() {

        when(loanRepository.findAll())
                .thenReturn(java.util.Collections.emptyList());

        java.util.List<LoanResponse> responses =
                loanService.findAll();

        assertNotNull(responses);
        assertTrue(responses.isEmpty());

        verify(loanRepository).findAll();

        verifyNoInteractions(
                associateRepository,
                transactionService,
                loanInstallmentService,
                savingsFundMonthlyService
        );
    }

    @Test
    void shouldApproveLoanSuccessfully() {

        Loan loan = LoanTestData.pendingLoan();

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        when(loanRepository.save(any(Loan.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        LoanResponse response =
                loanService.approve(TestConstants.LOAN_ID);

        assertNotNull(response);

        assertEquals(
                LoanStatus.APPROVED.name(),
                response.getStatus());

        assertNotNull(response.getApprovedAt());

        ArgumentCaptor<Loan> captor =
                ArgumentCaptor.forClass(Loan.class);

        verify(loanRepository).save(captor.capture());

        Loan updatedLoan = captor.getValue();

        assertEquals(
                LoanStatus.APPROVED,
                updatedLoan.getStatus());

        assertNotNull(
                updatedLoan.getApprovedAt());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);

        verifyNoInteractions(
                associateRepository,
                transactionService,
                loanInstallmentService,
                savingsFundMonthlyService
        );
    }

    @Test
    void shouldThrowExceptionWhenApprovingNonPendingLoan() {

        Loan loan = LoanTestData.approvedLoan();

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanService.approve(TestConstants.LOAN_ID));

        assertEquals(
                "La operación solo está permitida para préstamos pendientes",
                exception.getMessage());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);

        verify(loanRepository, never())
                .save(any());
    }

    @Test
    void shouldRejectLoanSuccessfully() {

        Loan loan = LoanTestData.pendingLoan();

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        when(loanRepository.save(any(Loan.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        LoanResponse response =
                loanService.reject(TestConstants.LOAN_ID);

        assertNotNull(response);

        assertEquals(
                LoanStatus.REJECTED.name(),
                response.getStatus());

        ArgumentCaptor<Loan> captor =
                ArgumentCaptor.forClass(Loan.class);

        verify(loanRepository).save(captor.capture());

        Loan updatedLoan = captor.getValue();

        assertEquals(
                LoanStatus.REJECTED,
                updatedLoan.getStatus());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);

        verifyNoInteractions(
                associateRepository,
                transactionService,
                loanInstallmentService,
                savingsFundMonthlyService
        );
    }

    @Test
    void shouldThrowExceptionWhenRejectingNonPendingLoan() {

        Loan loan = LoanTestData.disbursedLoan();

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanService.reject(TestConstants.LOAN_ID));

        assertEquals(
                "La operación solo está permitida para préstamos pendientes",
                exception.getMessage());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);

        verify(loanRepository, never())
                .save(any());
    }

    @Test
    void shouldThrowExceptionWhenLoanDoesNotExistForApproval() {

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanService.approve(TestConstants.LOAN_ID));

        assertEquals(
                "El préstamo no existe",
                exception.getMessage());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);
    }

    @Test
    void shouldThrowExceptionWhenLoanDoesNotExistForRejection() {

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanService.reject(TestConstants.LOAN_ID));

        assertEquals(
                "El préstamo no existe",
                exception.getMessage());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);
    }

    @Test
    void shouldDisburseLoanSuccessfully() {

        Loan loan = LoanTestData.approvedLoan();

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        when(loanRepository.save(any(Loan.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        LoanResponse response =
                loanService.disburse(TestConstants.LOAN_ID);

        assertNotNull(response);

        assertEquals(
                LoanStatus.DISBURSED.name(),
                response.getStatus());

        verify(savingsFundMonthlyService)
                .registerLoanDisbursement(
                        TestConstants.LOAN_AMOUNT);

        verify(transactionService)
                .depositLoan(
                        TestConstants.ASSOCIATE_ID,
                        TestConstants.LOAN_AMOUNT,
                        loan);

        verify(loanInstallmentService)
                .generateSchedule(
                        TestConstants.LOAN_ID);

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);

        verify(loanRepository)
                .save(any(Loan.class));

        verifyNoInteractions(
                associateRepository
        );
    }

    @Test
    void shouldThrowExceptionWhenDisbursingPendingLoan() {

        Loan loan = LoanTestData.pendingLoan();

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.of(loan));

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanService.disburse(TestConstants.LOAN_ID));

        assertEquals(
                "Solo se pueden desembolsar préstamos aprobados",
                exception.getMessage());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);

        verifyNoInteractions(
                savingsFundMonthlyService,
                transactionService,
                loanInstallmentService
        );

        verify(loanRepository, never())
                .save(any());
    }

    @Test
    void shouldThrowExceptionWhenLoanDoesNotExistForDisbursement() {

        when(loanRepository.findById(TestConstants.LOAN_ID))
                .thenReturn(Optional.empty());

        BusinessException exception =
                assertThrows(
                        BusinessException.class,
                        () -> loanService.disburse(TestConstants.LOAN_ID));

        assertEquals(
                "El préstamo no existe",
                exception.getMessage());

        verify(loanRepository)
                .findById(TestConstants.LOAN_ID);

        verifyNoInteractions(
                savingsFundMonthlyService,
                transactionService,
                loanInstallmentService
        );
    }
}