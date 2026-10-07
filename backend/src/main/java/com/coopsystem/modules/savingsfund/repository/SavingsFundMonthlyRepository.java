package com.coopsystem.modules.savingsfund.repository;

import com.coopsystem.modules.savingsfund.entity.SavingsFundMonthly;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SavingsFundMonthlyRepository
        extends JpaRepository<SavingsFundMonthly, Long> {

    Optional<SavingsFundMonthly> findByYearAndMonth(
            Integer year,
            Integer month
    );

    boolean existsByYearAndMonth(
            Integer year,
            Integer month
    );
}