package com.coopsystem.modules.health.controller;

import com.coopsystem.modules.health.dto.HealthRequest;
import com.coopsystem.modules.health.dto.HealthResponse;
import com.coopsystem.modules.health.service.HealthService;
import com.coopsystem.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping("/api/v1/health")
    @Operation(
            summary = "Verificar estado de la API",
            description = "Permite comprobar que CoopSystem está funcionando correctamente."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "La API está disponible."
    )
    public ApiResponse<HealthResponse> health() {

        return new ApiResponse<>(
                true,
                "CoopSystem API is running",
                healthService.getHealth()
        );
    }

    @PostMapping("/api/v1/health")
    @Operation(
            summary = "Validar petición de prueba",
            description = "Permite probar las validaciones de Spring Boot."
    )
    @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Petición válida."
    )
    public ApiResponse<String> validateHealth(
            @Valid @RequestBody HealthRequest request) {

        return new ApiResponse<>(
                true,
                "Validación exitosa",
                "Hola " + request.getName()
        );
    }
}