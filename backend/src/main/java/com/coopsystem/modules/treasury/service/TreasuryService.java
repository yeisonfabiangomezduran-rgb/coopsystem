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

    /**
     * Retira fondos para el desembolso de un préstamo.
     */
    @Transactional
    public void withdrawLoan(BigDecimal amount) {

        Treasury treasury = getTreasury();

        if (treasury.getBalance().compareTo(amount) < 0) {
            throw new BusinessException(
                    "La cooperativa no tiene fondos suficientes para desembolsar el préstamo");
        }

        treasury.setBalance(
                treasury.getBalance().subtract(amount)
        );

        treasuryRepository.save(treasury);
    }

    /**
     * Obtiene la Caja General.
     */
    private Treasury getTreasury() {

        return treasuryRepository.findByName(MAIN_TREASURY)
                .orElseThrow(() ->
                        new BusinessException(
                                "La Caja General no existe"));
    }

    /**
     * Convierte la entidad en DTO.
     */
    private TreasuryResponse toResponse(Treasury treasury) {

        return new TreasuryResponse(
                treasury.getId(),
                treasury.getName(),
                treasury.getBalance(),
                treasury.getCreatedAt()
        );
    }
}