package com.coopsystem.modules.report.service;

import com.coopsystem.modules.associate.repository.AssociateRepository;
import com.coopsystem.modules.loan.entity.InstallmentStatus;
import com.coopsystem.modules.loan.entity.LoanStatus;
import com.coopsystem.modules.loan.repository.LoanInstallmentRepository;
import com.coopsystem.modules.loan.repository.LoanRepository;
import com.coopsystem.modules.savings.entity.AccountStatus;
import com.coopsystem.modules.savings.repository.SavingsAccountRepository;
import com.coopsystem.modules.transaction.entity.TransactionType;
import com.coopsystem.modules.transaction.repository.TransactionRepository;
import com.coopsystem.modules.treasury.entity.Treasury;
import com.coopsystem.modules.treasury.repository.TreasuryRepository;
import com.coopsystem.modules.report.dto.AssociateReportResponse;
import com.coopsystem.modules.report.dto.DashboardReportResponse;
import com.coopsystem.modules.report.dto.LoanReportResponse;
import com.coopsystem.modules.report.dto.SavingsReportResponse;
import com.coopsystem.shared.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.coopsystem.modules.report.dto.TransactionReportResponse;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ReportService {

    private final AssociateRepository associateRepository;
    private final SavingsAccountRepository savingsAccountRepository;
    private final LoanRepository loanRepository;
    private final LoanInstallmentRepository loanInstallmentRepository;
    private final TransactionRepository transactionRepository;
    private final TreasuryRepository treasuryRepository;

    public ReportService(
            AssociateRepository associateRepository,
            SavingsAccountRepository savingsAccountRepository,
            LoanRepository loanRepository,
            LoanInstallmentRepository loanInstallmentRepository,
            TransactionRepository transactionRepository,
            TreasuryRepository treasuryRepository) {

        this.associateRepository = associateRepository;
        this.savingsAccountRepository = savingsAccountRepository;
        this.loanRepository = loanRepository;
        this.loanInstallmentRepository = loanInstallmentRepository;
        this.transactionRepository = transactionRepository;
        this.treasuryRepository = treasuryRepository;
    }

    /**
     * Obtiene los indicadores generales del sistema.
     */
    @Transactional(readOnly = true)
    public DashboardReportResponse getDashboard() {

        long totalAssociates =
                associateRepository.count();

        long activeSavingsAccounts =
                savingsAccountRepository.countByStatus(
                        AccountStatus.ACTIVE
                );

        long activeLoans =
                loanRepository.countByStatus(
                        LoanStatus.DISBURSED
                );

        long totalTransactions =
                transactionRepository.count();

        BigDecimal treasuryBalance =
                treasuryRepository.findByName("Caja General")
                        .map(Treasury::getBalance)
                        .orElseThrow(() ->
                                new BusinessException(
                                        "La Caja General no existe"
                                )
                        );

        long totalLoans =
                loanRepository.count();

        BigDecimal disbursedAmount =
                zeroIfNull(
                        transactionRepository.sumAmountByType(
                                TransactionType.LOAN_DISBURSEMENT
                        )
                );

        BigDecimal outstandingPrincipal =
                zeroIfNull(
                        loanInstallmentRepository
                                .sumOutstandingPrincipalForDisbursedLoans()
                );

        return new DashboardReportResponse(
                totalAssociates,
                activeSavingsAccounts,
                activeLoans,
                totalTransactions,
                treasuryBalance,
                totalLoans,
                disbursedAmount,
                outstandingPrincipal
        );
    }

    /**
     * Obtiene el reporte real de asociados.
     */
    @Transactional(readOnly = true)
    public List<AssociateReportResponse> getAssociatesReport() {

        return associateRepository.findAll()
                .stream()
                .map(associate -> new AssociateReportResponse(
                        associate.getCode(),
                        associate.getFirstName()
                                + " "
                                + associate.getLastName(),
                        associate.getDocumentType()
                                + " "
                                + associate.getDocumentNumber(),
                        associate.getStatus(),
                        associate.getEntryDate() != null
                                ? associate.getEntryDate().toString()
                                : null
                ))
                .toList();
    }

    /**
     * Obtiene el reporte real de cuentas de ahorro.
     */
    @Transactional(readOnly = true)
    public List<SavingsReportResponse> getSavingsReport() {

        return savingsAccountRepository.findAll()
                .stream()
                .map(account -> new SavingsReportResponse(
                        account.getAccountNumber(),
                        account.getAssociate().getFirstName()
                                + " "
                                + account.getAssociate().getLastName(),
                        account.getBalance(),
                        account.getStatus().name(),
                        account.getOpenedAt() != null
                                ? account.getOpenedAt()
                                        .toLocalDate()
                                        .toString()
                                : null
                ))
                .toList();
    }

    /**
     * Obtiene el reporte real de préstamos.
     */
    @Transactional(readOnly = true)
    public List<LoanReportResponse> getLoansReport() {

        return loanRepository.findAll()
                .stream()
                .map(loan -> {

                    BigDecimal outstandingBalance =
                            loanInstallmentRepository
                                    .findByLoanIdAndStatusOrderByInstallmentNumberAsc(
                                            loan.getId(),
                                            InstallmentStatus.PENDING
                                    )
                                    .stream()
                                    .map(installment -> {

                                        BigDecimal paidAmount =
                                                installment.getPaidAmount() != null
                                                        ? installment.getPaidAmount()
                                                        : BigDecimal.ZERO;

                                        BigDecimal interest =
                                                installment.getInterest() != null
                                                        ? installment.getInterest()
                                                        : BigDecimal.ZERO;

                                        BigDecimal principal =
                                                installment.getPrincipal() != null
                                                        ? installment.getPrincipal()
                                                        : BigDecimal.ZERO;

                                        BigDecimal principalPaid =
                                                paidAmount.subtract(interest);

                                        if (principalPaid.compareTo(
                                                BigDecimal.ZERO) < 0) {

                                            principalPaid =
                                                    BigDecimal.ZERO;
                                        }

                                        if (principalPaid.compareTo(
                                                principal) > 0) {

                                            principalPaid = principal;
                                        }

                                        return principal.subtract(
                                                principalPaid
                                        );
                                    })
                                    .reduce(
                                            BigDecimal.ZERO,
                                            BigDecimal::add
                                    );

                    return new LoanReportResponse(
                            loan.getLoanNumber(),

                            loan.getAssociate().getFirstName()
                                    + " "
                                    + loan.getAssociate().getLastName(),

                            loan.getAmount(),

                            outstandingBalance,

                            loan.getInterestRate(),

                            loan.getTermMonths(),

                            loan.getStatus().name(),

                            loan.getRequestedAt() != null
                                    ? loan.getRequestedAt()
                                            .toLocalDate()
                                            .toString()
                                    : null,

                            loan.getApprovedAt() != null
                                    ? loan.getApprovedAt()
                                            .toLocalDate()
                                            .toString()
                                    : null
                    );
                })
                .toList();
    }

    /**
 * Obtiene el reporte real de transacciones.
 */
@Transactional(readOnly = true)
public List<TransactionReportResponse> getTransactionsReport() {

    return transactionRepository
            .findAllByOrderByTransactionDateDesc()
            .stream()
            .map(transaction -> {

                String user = "Sistema";

                if (transaction.getSavingsAccount() != null
                        && transaction.getSavingsAccount().getAssociate() != null) {

                    user =
                            transaction.getSavingsAccount()
                                    .getAssociate()
                                    .getFirstName()
                            + " "
                            + transaction.getSavingsAccount()
                                    .getAssociate()
                                    .getLastName();

                } else if (transaction.getLoan() != null
                        && transaction.getLoan().getAssociate() != null) {

                    user =
                            transaction.getLoan()
                                    .getAssociate()
                                    .getFirstName()
                            + " "
                            + transaction.getLoan()
                                    .getAssociate()
                                    .getLastName();
                }

                return new TransactionReportResponse(
                        "TRX-" + transaction.getId(),
                        transaction.getTransactionType().name(),
                        transaction.getTransactionDate() != null
                                ? transaction.getTransactionDate()
                                        .toLocalDate()
                                        .toString()
                                : null,
                        transaction.getAmount(),
                        user
                );
            })
            .toList();
}

    /**
     * Convierte valores null de tipo BigDecimal a cero.
     */
    private BigDecimal zeroIfNull(BigDecimal value) {
        return value != null
                ? value
                : BigDecimal.ZERO;
    }
}