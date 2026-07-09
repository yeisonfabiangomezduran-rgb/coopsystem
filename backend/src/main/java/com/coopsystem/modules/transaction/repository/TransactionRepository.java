package com.coopsystem.modules.transaction.repository;

import com.coopsystem.modules.transaction.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    List<Transaction> findBySavingsAccountIdOrderByTransactionDateDesc(Long accountId);

}