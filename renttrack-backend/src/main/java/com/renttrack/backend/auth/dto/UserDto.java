package com.renttrack.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Safe user DTO — does NOT expose password hash.
 * Returned by GET /api/auth/me
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private UUID id;
    private String name;
    private String email;
    private String role;
}