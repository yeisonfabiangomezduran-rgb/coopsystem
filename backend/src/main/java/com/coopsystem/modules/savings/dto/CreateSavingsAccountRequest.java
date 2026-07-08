package com.coopsystem.modules.savings.dto;

import jakarta.validation.constraints.NotNull;

public class CreateSavingsAccountRequest {

    @NotNull(message = "El id del asociado es obligatorio")
    private Long associateId;

    public CreateSavingsAccountRequest() {
    }

    public Long getAssociateId() {
        return associateId;
    }

    public void setAssociateId(Long associateId) {
        this.associateId = associateId;
    }
}