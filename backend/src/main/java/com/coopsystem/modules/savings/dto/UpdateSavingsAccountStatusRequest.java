package com.coopsystem.modules.savings.dto;

import com.coopsystem.modules.savings.entity.AccountStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateSavingsAccountStatusRequest {

    @NotNull(message = "El estado es obligatorio")
    private AccountStatus status;

    public AccountStatus getStatus() {
        return status;
    }

    public void setStatus(AccountStatus status) {
        this.status = status;
    }
}
