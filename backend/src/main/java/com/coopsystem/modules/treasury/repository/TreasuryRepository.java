package com.coopsystem.modules.treasury.repository;

import com.coopsystem.modules.treasury.entity.Treasury;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TreasuryRepository
        extends JpaRepository<Treasury, Long> {

    Optional<Treasury> findByName(String name);

}