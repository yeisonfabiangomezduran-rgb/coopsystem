package com.coopsystem.modules.transaction.repository;

import com.coopsystem.modules.transaction.entity.Transaction;
import com.coopsystem.modules.transaction.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    List<Transaction> findBySavingsAccountIdOrderByTransactionDateDesc(
            Long savingsAccountId
    );

    List<Transaction> findByLoanIdOrderByTransactionDateDesc(
            Long loanId
    );

    List<Transaction> findAllByOrderByTransactionDateDesc();

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.transactionType = :type
            """)
    BigDecimal sumAmountByType(@Param("type") TransactionType type);
}
