package com.coopsystem.modules.associate.controller;

import com.coopsystem.modules.associate.dto.AssociateResponse;
import com.coopsystem.modules.associate.dto.CreateAssociateRequest;
import com.coopsystem.modules.associate.entity.Associate;
import com.coopsystem.modules.associate.service.AssociateService;
import com.coopsystem.shared.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/associates")
public class AssociateController {

    private final AssociateService associateService;

    public AssociateController(AssociateService associateService) {
        this.associateService = associateService;
    }

    @GetMapping
    @Operation(
            summary = "Listar asociados",
            description = "Obtiene todos los asociados registrados."
    )
    public ApiResponse<List<Associate>> findAll() {

        return new ApiResponse<>(
                true,
                "Lista de asociados",
                associateService.findAll()
        );
    }

    @GetMapping("/{id}")
    @Operation(
            summary = "Buscar asociado por ID",
            description = "Obtiene un asociado por su identificador."
    )
    public ApiResponse<AssociateResponse> findById(
            @PathVariable Long id) {

        return new ApiResponse<>(
                true,
                "Asociado encontrado",
                associateService.findById(id)
        );
    }

    @PostMapping
    @Operation(
            summary = "Crear asociado",
            description = "Registra un nuevo asociado."
    )
    public ApiResponse<AssociateResponse> create(
            @Valid @RequestBody CreateAssociateRequest request) {

        return new ApiResponse<>(
                true,
                "Asociado creado correctamente",
                associateService.create(request)
        );
    }
}