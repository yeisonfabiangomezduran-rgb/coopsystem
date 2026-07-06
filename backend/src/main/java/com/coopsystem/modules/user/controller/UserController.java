package com.coopsystem.modules.user.controller;

import com.coopsystem.modules.user.dto.CreateUserRequest;
import com.coopsystem.modules.user.dto.UserResponse;
import com.coopsystem.modules.user.service.UserService;
import com.coopsystem.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @Operation(
            summary = "Crear usuario",
            description = "Registra un nuevo usuario."
    )
    public ApiResponse<UserResponse> create(
            @Valid @RequestBody CreateUserRequest request) {

        return new ApiResponse<>(
                true,
                "Usuario creado correctamente",
                userService.create(request)
        );
    }
}