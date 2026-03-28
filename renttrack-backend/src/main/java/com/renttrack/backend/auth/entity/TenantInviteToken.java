package com.renttrack.backend.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tenant_invite_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantInviteToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // The random token sent in the email link
    @Column(nullable = false, unique = true)
    private String token;

    // Tenant's email — used to create their User account later
    @Column(nullable = false)
    private String email;

    // Tenant's full name — used to pre-fill their account name
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Instant expiresAt;

    private boolean used = false;
}
