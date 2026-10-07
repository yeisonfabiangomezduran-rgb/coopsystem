package com.coopsystem.modules.savingsfund.controller;

import com.coopsystem.modules.savingsfund.dto.SavingsFundMonthlyResponse;
import com.coopsystem.modules.savingsfund.entity.SavingsFundMonthly;
import com.coopsystem.modules.savingsfund.service.SavingsFundMonthlyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/savings-fund")
public class SavingsFundMonthlyController {

    private final SavingsFundMonthlyService savingsFundService;

    public SavingsFundMonthlyController(
            SavingsFundMonthlyService savingsFundService) {
        this.savingsFundService = savingsFundService;
    }

    @GetMapping("/month/{year}/{month}")
    public ResponseEntity<SavingsFundMonthlyResponse> getMonthlyFund(
            @PathVariable Integer year,
            @PathVariable Integer month) {

        SavingsFundMonthly fund =
                savingsFundService.getMonthlyFund(year, month);

        return ResponseEntity.ok(toResponse(fund));
    }

    @GetMapping("/history")
    public ResponseEntity<List<SavingsFundMonthlyResponse>> getHistory() {

        List<SavingsFundMonthlyResponse> response =
                savingsFundService.getHistory()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(response);
    }

    @PutMapping("/month/{year}/{month}")
    public ResponseEntity<SavingsFundMonthlyResponse> configureMonthlyFund(
            @PathVariable Integer year,
            @PathVariable Integer month,
            @RequestParam BigDecimal loanPercentage) {

        SavingsFundMonthly fund =
                savingsFundService.configureMonthlyFund(
                        year,
                        month,
                        loanPercentage
                );

        return ResponseEntity.ok(toResponse(fund));
    }

    @PostMapping("/month/{year}/{month}/recalculate")
    public ResponseEntity<SavingsFundMonthlyResponse> recalculateMonthlyFund(
            @PathVariable Integer year,
            @PathVariable Integer month) {

        SavingsFundMonthly fund =
                savingsFundService.recalculateMonthlyFund(
                        year,
                        month
                );

        return ResponseEntity.ok(toResponse(fund));
    }

    @PostMapping("/month/{year}/{month}/close")
    public ResponseEntity<SavingsFundMonthlyResponse> closeMonthlyFund(
            @PathVariable Integer year,
            @PathVariable Integer month) {

        SavingsFundMonthly fund =
                savingsFundService.closeMonthlyFund(
                        year,
                        month
                );

        return ResponseEntity.ok(toResponse(fund));
    }

    private SavingsFundMonthlyResponse toResponse(
            SavingsFundMonthly fund) {

        return new SavingsFundMonthlyResponse(
                fund.getId(),
                fund.getYear(),
                fund.getMonth(),
                fund.getTotalSavingsDeposits(),
                fund.getPreviousMonthBalance(),
                fund.getLoanPercentage(),
                fund.getReturnsPercentage(),
                fund.getLoanFundAmount(),
                fund.getReturnsReserveAmount(),
                fund.getLoanDisbursements(),
                fund.getLoanFundAvailable(),
                fund.getStatus(),
                fund.getClosedAt()
        );
    }
}