package com.coopsystem.modules.health.service;

import com.coopsystem.modules.health.dto.HealthResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class HealthServiceTest {

    private final HealthService healthService =
            new HealthService();

    @Test
    void shouldReturnHealthSuccessfully() {

        HealthResponse response =
                healthService.getHealth();

        assertNotNull(response);

        assertEquals(
                "UP",
                response.getStatus());

        assertEquals(
                "0.1.0",
                response.getVersion());
    }
}