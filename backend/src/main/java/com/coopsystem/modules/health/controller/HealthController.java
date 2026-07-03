package com.coopsystem.modules.health.controller;

import com.coopsystem.modules.health.dto.HealthResponse;
import com.coopsystem.modules.health.service.HealthService;
import com.coopsystem.shared.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    @GetMapping("/api/v1/health")
    public ApiResponse<HealthResponse> health() {

        return new ApiResponse<>(
                true,
                "CoopSystem API is running",
                healthService.getHealth()
        );

    }
}