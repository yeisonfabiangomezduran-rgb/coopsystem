package com.coopsystem.modules.associate.controller;

import com.coopsystem.modules.associate.dto.AssociateResponse;
import com.coopsystem.modules.associate.dto.CreateAssociateRequest;
import com.coopsystem.modules.associate.dto.UpdateAssociateRequest;
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
    public ApiResponse<List<AssociateResponse>> findAll() {

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

    @PutMapping("/{id}")
    @Operation(
            summary = "Actualizar asociado",
            description = "Actualiza la información de un asociado."
    )
    public ApiResponse<AssociateResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAssociateRequest request) {

        return new ApiResponse<>(
                true,
                "Asociado actualizado correctamente",
                associateService.update(id, request)
        );
    }

    @DeleteMapping("/{id}")
    @Operation(
            summary = "Eliminar asociado",
            description = "Elimina un asociado por su identificador."
    )
    public ApiResponse<Void> delete(
            @PathVariable Long id) {

        associateService.delete(id);

        return new ApiResponse<>(
                true,
                "Asociado eliminado correctamente",
                null
        );
    }
}