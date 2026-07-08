package com.coopsystem.modules.savings.controller;

import com.coopsystem.modules.savings.dto.CreateSavingsAccountRequest;
import com.coopsystem.modules.savings.dto.SavingsAccountResponse;
import com.coopsystem.modules.savings.service.SavingsAccountService;
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
}