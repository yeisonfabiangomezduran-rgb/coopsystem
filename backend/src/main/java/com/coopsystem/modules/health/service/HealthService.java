package com.coopsystem.modules.health.service;

import com.coopsystem.modules.health.dto.HealthResponse;
import org.springframework.stereotype.Service;

@Service
public class HealthService {

    public HealthResponse getHealth() {
        return new HealthResponse(
                "UP",
                "0.1.0"
        );
    }
}