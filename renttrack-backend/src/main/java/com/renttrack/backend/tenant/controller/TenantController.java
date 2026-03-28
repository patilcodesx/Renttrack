package com.renttrack.backend.tenant.controller;

import com.renttrack.backend.common.enums.TenantStatus;
import com.renttrack.backend.common.response.ApiResponse;
import com.renttrack.backend.tenant.dto.TenantRequest;
import com.renttrack.backend.tenant.dto.TenantResponse;
import com.renttrack.backend.tenant.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/tenants")
@RequiredArgsConstructor
@CrossOrigin
public class TenantController {

    private final TenantService tenantService;

    // ── CREATE ───────────────────────────────────
    @PreAuthorize("hasAnyRole('ADMIN','LANDLORD')")
    @PostMapping
    public ResponseEntity<ApiResponse<TenantResponse>> create(
            @RequestBody TenantRequest req) {

        return ResponseEntity.status(201)
                .body(ApiResponse.success(
                        "Tenant created successfully",
                        tenantService.create(req)
                ));
    }

    // ── GET ALL ──────────────────────────────────
    @PreAuthorize("hasAnyRole('ADMIN','LANDLORD')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<TenantResponse>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.success(tenantService.findAll())
        );
    }

    // ── GET BY ID ────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TenantResponse>> getById(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                ApiResponse.success(tenantService.findById(id))
        );
    }

    // ── GET BY PROPERTY ──────────────────────────
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<TenantResponse>>> getByProperty(
            @PathVariable UUID propertyId) {

        return ResponseEntity.ok(
                ApiResponse.success(tenantService.findByProperty(propertyId))
        );
    }

    // ── SEARCH ───────────────────────────────────
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<TenantResponse>>> search(
            @RequestParam String query) {

        return ResponseEntity.ok(
                ApiResponse.success(tenantService.search(query))
        );
    }

    // ── UPDATE ───────────────────────────────────
    @PreAuthorize("hasAnyRole('ADMIN','LANDLORD')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TenantResponse>> update(
            @PathVariable UUID id,
            @RequestBody TenantRequest req) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Tenant updated successfully",
                        tenantService.update(id, req)
                )
        );
    }

    // ── UPDATE STATUS ────────────────────────────
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TenantResponse>> updateStatus(
            @PathVariable UUID id,
            @RequestParam TenantStatus status) {

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Status updated",
                        tenantService.updateStatus(id, status)
                )
        );
    }

    // ── DELETE ───────────────────────────────────
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id) {

        tenantService.delete(id);
        return ResponseEntity.ok(
                ApiResponse.success("Tenant deleted", null)
        );
    }
}