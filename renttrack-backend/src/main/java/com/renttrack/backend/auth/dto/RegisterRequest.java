package com.renttrack.backend.auth.dto;

import com.renttrack.backend.common.enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private Role role;
}
