package com.renttrack.backend.auth.dto;

import com.renttrack.backend.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String id;
    private String token;
    private String name;
    private String email;
    private String role;

    public static AuthResponse from(String token, User user) {
        return AuthResponse.builder()
                .id(user.getId().toString())
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}