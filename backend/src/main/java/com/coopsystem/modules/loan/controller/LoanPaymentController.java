package com.coopsystem.modules.loan.controller;

import com.coopsystem.modules.loan.dto.request.LoanPaymentRequest;
import com.coopsystem.modules.loan.dto.response.LoanPaymentResponse;
import com.coopsystem.modules.loan.service.LoanPaymentService;
import com.coopsystem.shared.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/loans")
public class LoanPaymentController {

    private final LoanPaymentService loanPaymentService;

    public LoanPaymentController(
            LoanPaymentService loanPaymentService) {

        this.loanPaymentService = loanPaymentService;
    }

    /**
     * Registra el pago de la siguiente cuota pendiente.
     */
    @PostMapping("/{loanId}/payments")
    public ApiResponse<LoanPaymentResponse> pay(
            @PathVariable Long loanId,
            @Valid @RequestBody LoanPaymentRequest request) {

        return ApiResponse.success(
                "Pago registrado correctamente",
                loanPaymentService.pay(
                        loanId,
                        request)
        );
    }

}