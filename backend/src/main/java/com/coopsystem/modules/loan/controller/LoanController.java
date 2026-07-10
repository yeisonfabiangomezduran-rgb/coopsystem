package com.coopsystem.modules.loan.controller;

import com.coopsystem.modules.loan.dto.request.CreateLoanRequest;
import com.coopsystem.modules.loan.dto.response.LoanResponse;
import com.coopsystem.modules.loan.service.LoanService;
import com.coopsystem.shared.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/loans")
public class LoanController {

    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @GetMapping
    public ApiResponse<List<LoanResponse>> findAll() {

        return ApiResponse.success(
                "Listado de préstamos obtenido correctamente",
                loanService.findAll()
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<LoanResponse> findById(
            @PathVariable Long id) {

        return ApiResponse.success(
                "Préstamo encontrado correctamente",
                loanService.findById(id)
        );
    }

    @GetMapping("/number/{loanNumber}")
    public ApiResponse<LoanResponse> findByLoanNumber(
            @PathVariable String loanNumber) {

        return ApiResponse.success(
                "Préstamo encontrado correctamente",
                loanService.findByLoanNumber(loanNumber)
        );
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<LoanResponse> create(
            @Valid @RequestBody CreateLoanRequest request) {

        LoanResponse response = loanService.create(request);

        return ApiResponse.success(
                "Préstamo solicitado correctamente",
                response
        );
    }

    @PatchMapping("/{id}/approve")
    public ApiResponse<LoanResponse> approve(
            @PathVariable Long id) {

        return ApiResponse.success(
                "Préstamo aprobado correctamente",
                loanService.approve(id)
        );
    }

    @PatchMapping("/{id}/reject")
    public ApiResponse<LoanResponse> reject(
            @PathVariable Long id) {

        return ApiResponse.success(
                "Préstamo rechazado correctamente",
                loanService.reject(id)
        );
    }

    @PatchMapping("/{id}/disburse")
    public ApiResponse<LoanResponse> disburse(
            @PathVariable Long id) {

        return ApiResponse.success(
                "Préstamo desembolsado correctamente",
                loanService.disburse(id)
        );
    }

    
}