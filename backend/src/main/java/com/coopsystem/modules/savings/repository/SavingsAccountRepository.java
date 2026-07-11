package com.coopsystem.modules.savings.repository;

import com.coopsystem.modules.savings.entity.SavingsAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SavingsAccountRepository
        extends JpaRepository<SavingsAccount, Long> {

    Optional<SavingsAccount> findByAccountNumber(String accountNumber);

    Optional<SavingsAccount> findByAssociateId(Long associateId);

    boolean existsByAssociateId(Long associateId);

}