package com.coopsystem.modules.auth.controller;

import com.coopsystem.modules.auth.dto.LoginRequest;
import com.coopsystem.modules.auth.dto.LoginResponse;
import com.coopsystem.modules.auth.service.AuthService;
import com.coopsystem.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(
            summary = "Iniciar sesión",
            description = "Autentica un usuario y retorna un token."
    )
    public ApiResponse<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return new ApiResponse<>(
                true,
                "Inicio de sesión exitoso",
                authService.login(request)
        );
    }
}