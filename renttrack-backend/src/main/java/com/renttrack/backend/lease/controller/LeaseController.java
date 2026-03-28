package com.renttrack.backend.lease.controller;

import com.renttrack.backend.common.response.ApiResponse;
import com.renttrack.backend.tenant.dto.TenantResponse;
import com.renttrack.backend.tenant.entity.Tenant;
import com.renttrack.backend.tenant.repository.TenantRepository;
import com.renttrack.backend.user.repository.UserRepository;
import com.renttrack.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/lease")
@RequiredArgsConstructor
@CrossOrigin
public class LeaseController {

    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;

    /**
     * GET /api/lease/me
     * Returns the current authenticated tenant's lease info
     * Used by Lease.tsx
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyLease(
            Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        // Find user by email
        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find tenant linked to this user (by email match since user↔tenant are linked via email)
        Tenant tenant = tenantRepository
                .findByEmail(user.getEmail())
                .orElseThrow(() -> new RuntimeException("No tenant record found for this account"));

        Map<String, Object> leaseData = Map.of(
                "tenantId", tenant.getId().toString(),
                "fullName", tenant.getFullName() != null ? tenant.getFullName() : "",
                "propertyId", tenant.getProperty() != null ? tenant.getProperty().getId().toString() : "",
                "propertyTitle", tenant.getProperty() != null && tenant.getProperty().getTitle() != null
                        ? tenant.getProperty().getTitle() : "",
                "unitNumber", tenant.getUnitNumber() != null ? tenant.getUnitNumber() : "",
                "rentAmount", tenant.getMonthlyRent() != null ? tenant.getMonthlyRent() : BigDecimal.ZERO,
                "leaseStart", tenant.getLeaseStart() != null ? tenant.getLeaseStart().toString() : "",
                "leaseEnd", tenant.getLeaseEnd() != null ? tenant.getLeaseEnd().toString() : "",
                "status", tenant.getStatus().name()
        );

        return ResponseEntity.ok(ApiResponse.success(leaseData));
    }
}