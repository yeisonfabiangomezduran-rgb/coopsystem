package com.coopsystem.modules.treasury.controller;

import com.coopsystem.modules.treasury.dto.request.DepositTreasuryRequest;
import com.coopsystem.modules.treasury.dto.request.WithdrawTreasuryRequest;
import com.coopsystem.modules.treasury.dto.response.TreasuryResponse;
import com.coopsystem.modules.treasury.service.TreasuryService;
import com.coopsystem.shared.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/treasury")
public class TreasuryController {

    private final TreasuryService treasuryService;

    public TreasuryController(TreasuryService treasuryService) {
        this.treasuryService = treasuryService;
    }

    @GetMapping
    public ApiResponse<TreasuryResponse> findTreasury() {

        return ApiResponse.success(
                "Caja General obtenida correctamente",
                treasuryService.findTreasury()
        );
    }

    @PostMapping("/deposit")
    public ApiResponse<TreasuryResponse> deposit(
            @Valid @RequestBody DepositTreasuryRequest request) {

        return ApiResponse.success(
                "Ingreso registrado correctamente",
                treasuryService.deposit(request)
        );
    }

    @PostMapping("/withdraw")
    public ApiResponse<TreasuryResponse> withdraw(
            @Valid @RequestBody WithdrawTreasuryRequest request) {

        return ApiResponse.success(
                "Retiro registrado correctamente",
                treasuryService.withdraw(request)
        );
    }
}