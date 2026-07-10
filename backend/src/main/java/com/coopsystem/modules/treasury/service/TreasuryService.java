package com.coopsystem.modules.treasury.service;

import com.coopsystem.modules.treasury.dto.request.DepositTreasuryRequest;
import com.coopsystem.modules.treasury.dto.request.WithdrawTreasuryRequest;
import com.coopsystem.modules.treasury.dto.response.TreasuryResponse;
import com.coopsystem.modules.treasury.entity.Treasury;
import com.coopsystem.modules.treasury.repository.TreasuryRepository;
import com.coopsystem.shared.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class TreasuryService {

    private static final String MAIN_TREASURY = "Caja General";

    private final TreasuryRepository treasuryRepository;

    public TreasuryService(TreasuryRepository treasuryRepository) {
        this.treasuryRepository = treasuryRepository;
    }

    @Transactional(readOnly = true)
    public TreasuryResponse findTreasury() {

        return toResponse(getTreasury());
    }

    @Transactional
    public TreasuryResponse deposit(
            DepositTreasuryRequest request) {

        Treasury treasury = getTreasury();

        treasury.setBalance(
                treasury.getBalance().add(request.getAmount())
        );

        Treasury updated = treasuryRepository.save(treasury);

        return toResponse(updated);
    }

    @Transactional
    public TreasuryResponse withdraw(
            WithdrawTreasuryRequest request) {

        Treasury treasury = getTreasury();

        if (treasury.getBalance().compareTo(request.getAmount()) < 0) {
            throw new BusinessException(
                    "Fondos insuficientes en la caja de la cooperativa");
        }

        treasury.setBalance(
                treasury.getBalance().subtract(request.getAmount())
        );

        Treasury updated = treasuryRepository.save(treasury);

        return toResponse(updated);
    }

    private Treasury getTreasury() {

        return treasuryRepository.findByName(MAIN_TREASURY)
                .orElseThrow(() ->
                        new BusinessException(
                                "La Caja General no existe"));
    }

    private TreasuryResponse toResponse(Treasury treasury) {

        return new TreasuryResponse(
                treasury.getId(),
                treasury.getName(),
                treasury.getBalance(),
                treasury.getCreatedAt()
        );
    }
}