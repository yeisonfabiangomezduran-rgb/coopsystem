package com.coopsystem.testdata;

import com.coopsystem.modules.loan.entity.Loan;
import com.coopsystem.modules.loan.entity.LoanStatus;
import com.coopsystem.util.ReflectionHelper;
import com.coopsystem.util.TestConstants;

import java.time.LocalDateTime;

public final class LoanTestData {

    private LoanTestData() {
    }

    public static Loan pendingLoan() {

        Loan loan = new Loan();

        ReflectionHelper.setId(
                loan,
                TestConstants.LOAN_ID);

        loan.setLoanNumber(
                TestConstants.LOAN_NUMBER);

        loan.setAssociate(
                AssociateTestData.validAssociate());

        loan.setAmount(
                TestConstants.LOAN_AMOUNT);

        loan.setInterestRate(
                TestConstants.INTEREST_RATE);

        loan.setTermMonths(
                TestConstants.TERM_MONTHS);

        loan.setStatus(
                LoanStatus.PENDING);

        loan.setRequestedAt(
                LocalDateTime.now());

        return loan;
    }

    public static Loan approvedLoan() {

        Loan loan = pendingLoan();

        loan.setStatus(
                LoanStatus.APPROVED);

        loan.setApprovedAt(
                LocalDateTime.now());

        return loan;
    }

    public static Loan disbursedLoan() {

        Loan loan = approvedLoan();

        loan.setStatus(
                LoanStatus.DISBURSED);

        return loan;
    }

}