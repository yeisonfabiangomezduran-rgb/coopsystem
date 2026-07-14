package com.coopsystem.modules.loan.controller;

import com.coopsystem.modules.loan.dto.response.LoanInstallmentResponse;
import com.coopsystem.modules.loan.service.LoanInstallmentService;
import com.coopsystem.shared.response.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/loans")
public class LoanInstallmentController {

    private final LoanInstallmentService loanInstallmentService;

    public LoanInstallmentController(
            LoanInstallmentService loanInstallmentService) {

        this.loanInstallmentService = loanInstallmentService;
    }

    /**
     * Genera el cronograma de un préstamo.
     */
    @PostMapping("/{loanId}/installments/generate")
    public ApiResponse<Void> generateSchedule(
            @PathVariable Long loanId) {

        loanInstallmentService.generateSchedule(loanId);

        return ApiResponse.success(
                "Cronograma generado correctamente",
                null
        );
    }

    /**
     * Consulta el cronograma de un préstamo.
     */
    @GetMapping("/{loanId}/installments")
    public ApiResponse<List<LoanInstallmentResponse>> findByLoan(
            @PathVariable Long loanId) {

        return ApiResponse.success(
                "Cronograma obtenido correctamente",
                loanInstallmentService.findByLoan(loanId)
        );
    }

}