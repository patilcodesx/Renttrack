package com.renttrack.backend.auth.repository;

import com.renttrack.backend.auth.entity.TenantInviteToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantInviteTokenRepository extends JpaRepository<TenantInviteToken, UUID> {

    Optional<TenantInviteToken> findByToken(String token);

    // Cleanup: delete all old tokens for same email before creating new one
    void deleteByEmail(String email);
}
