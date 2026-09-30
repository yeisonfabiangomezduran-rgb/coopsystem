package com.coopsystem.modules.transaction.controller;

import com.coopsystem.modules.transaction.dto.DepositRequest;
import com.coopsystem.modules.transaction.dto.DepositResponse;
import com.coopsystem.modules.transaction.dto.TransactionResponse;
import com.coopsystem.modules.transaction.dto.WithdrawRequest;
import com.coopsystem.modules.transaction.dto.WithdrawResponse;
import com.coopsystem.modules.transaction.service.TransactionService;
import com.coopsystem.shared.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    /**
     * Obtiene el historial de transacciones de una cuenta.
     */
    @GetMapping("/account/{savingsAccountId}")
    public ApiResponse<List<TransactionResponse>> findTransactions(
            @PathVariable Long savingsAccountId) {

        return ApiResponse.success(
                "Historial obtenido correctamente",
                transactionService.findTransactions(savingsAccountId)
        );
    }

    /**
     * Obtiene las transacciones relacionadas con un préstamo.
     */
    @GetMapping("/loan/{loanId}")
    public ApiResponse<List<TransactionResponse>> findLoanTransactions(
            @PathVariable Long loanId) {

        return ApiResponse.success(
                "Historial del préstamo obtenido correctamente",
                transactionService.findLoanTransactions(loanId)
        );
    }

    /**
     * Registra una consignación.
     */
    @PostMapping("/deposit/{savingsAccountId}")
    public ApiResponse<DepositResponse> deposit(
            @PathVariable Long savingsAccountId,
            @Valid @RequestBody DepositRequest request) {

        return ApiResponse.success(
                "Consignación realizada correctamente",
                transactionService.deposit(
                        savingsAccountId,
                        request
                )
        );
    }

    /**
     * Registra un retiro.
     */
    @PostMapping("/withdraw/{savingsAccountId}")
    public ApiResponse<WithdrawResponse> withdraw(
            @PathVariable Long savingsAccountId,
            @Valid @RequestBody WithdrawRequest request) {

        return ApiResponse.success(
                "Retiro realizado correctamente",
                transactionService.withdraw(
                        savingsAccountId,
                        request
                )
        );
    }

    @GetMapping
public ApiResponse<List<TransactionResponse>> findAllTransactions() {

    return ApiResponse.success(
            "Historial general obtenido correctamente",
            transactionService.findAllTransactions()
    );
}
}