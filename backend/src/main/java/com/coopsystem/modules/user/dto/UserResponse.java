package com.coopsystem.modules.user.dto;

public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private Boolean enabled;

    public UserResponse(Long id, String username, String email, Boolean enabled) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.enabled = enabled;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public Boolean getEnabled() {
        return enabled;
    }
}