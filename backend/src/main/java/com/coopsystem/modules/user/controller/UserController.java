package com.coopsystem.modules.user.controller;

import com.coopsystem.modules.user.dto.CreateUserRequest;
import com.coopsystem.modules.user.dto.UserResponse;
import com.coopsystem.modules.user.service.UserService;
import com.coopsystem.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping
    @Operation(
            summary = "Listar usuarios",
            description = "Obtiene todos los usuarios registrados."
    )
    public ApiResponse<List<UserResponse>> findAll() {

        return new ApiResponse<>(
                true,
                "Lista de usuarios",
                userService.findAll()
        );
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Buscar usuario por ID",
            description = "Obtiene un usuario por su identificador."
    )
    public ApiResponse<UserResponse> findById(
            @PathVariable Long id) {

        return new ApiResponse<>(
                true,
                "Usuario encontrado",
                userService.findById(id)
        );
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Actualizar usuario",
            description = "Actualiza el nombre de usuario, correo y contraseña."
    )
    public ApiResponse<UserResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateUserRequest request) {

        return new ApiResponse<>(
                true,
                "Usuario actualizado correctamente",
                userService.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Eliminar usuario",
            description = "Elimina un usuario por su identificador."
    )
    public ApiResponse<Void> delete(
            @PathVariable Long id) {

        userService.delete(id);

        return new ApiResponse<>(
                true,
                "Usuario eliminado correctamente",
                null
        );
    }
}
