package com.coopsystem.modules.savings.controller;

import com.coopsystem.modules.savings.dto.CreateSavingsAccountRequest;
import com.coopsystem.modules.savings.dto.DepositRequest;
import com.coopsystem.modules.savings.dto.DepositResponse;
import com.coopsystem.modules.savings.dto.SavingsAccountResponse;
import com.coopsystem.modules.savings.dto.WithdrawRequest;
import com.coopsystem.modules.savings.dto.WithdrawResponse;
import com.coopsystem.modules.savings.service.SavingsAccountService;
import com.coopsystem.modules.transaction.dto.TransactionResponse;
import com.coopsystem.shared.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/savings-accounts")
public class SavingsAccountController {

    private final SavingsAccountService savingsAccountService;

    public SavingsAccountController(
            SavingsAccountService savingsAccountService) {

        this.savingsAccountService = savingsAccountService;
    }

    @GetMapping
    public ApiResponse<List<SavingsAccountResponse>> findAll() {

        return ApiResponse.success(
                "Listado de cuentas obtenido correctamente",
                savingsAccountService.findAll()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<SavingsAccountResponse> findById(
            @PathVariable Long id) {

        return ApiResponse.success(
                "Cuenta encontrada correctamente",
                savingsAccountService.findById(id)
        );
    }

    @GetMapping("/account/{accountNumber}")
    public ApiResponse<SavingsAccountResponse> findByAccountNumber(
            @PathVariable String accountNumber) {

        return ApiResponse.success(
                "Cuenta encontrada correctamente",
                savingsAccountService.findByAccountNumber(accountNumber)
        );
    }

    @GetMapping("/{id}/transactions")
    public ApiResponse<List<TransactionResponse>> findTransactions(
            @PathVariable Long id) {

        return ApiResponse.success(
                "Historial obtenido correctamente",
                savingsAccountService.findTransactions(id)
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<SavingsAccountResponse> create(
            @Valid @RequestBody CreateSavingsAccountRequest request) {

        SavingsAccountResponse response =
                savingsAccountService.create(request);

        return ApiResponse.success(
                "Cuenta de ahorro creada correctamente",
                response
        );
    }

    @PostMapping("/{id}/deposit")
    public ApiResponse<DepositResponse> deposit(
            @PathVariable Long id,
            @Valid @RequestBody DepositRequest request) {

        return ApiResponse.success(
                "Consignación realizada correctamente",
                savingsAccountService.deposit(id, request)
        );
    }

    @PostMapping("/{id}/withdraw")
    public ApiResponse<WithdrawResponse> withdraw(
            @PathVariable Long id,
            @Valid @RequestBody WithdrawRequest request) {

        return ApiResponse.success(
                "Retiro realizado correctamente",
                savingsAccountService.withdraw(id, request)
        );
    }
}