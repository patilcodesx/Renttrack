package com.renttrack.backend.dashboard.controller;
import org.springframework.transaction.annotation.Transactional;
import com.renttrack.backend.common.response.ApiResponse;
import com.renttrack.backend.payment.repository.PaymentRepository;
import com.renttrack.backend.property.repository.PropertyRepository;
import com.renttrack.backend.tenant.entity.Tenant;
import com.renttrack.backend.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.renttrack.backend.user.entity.User;
import com.renttrack.backend.user.repository.UserRepository;
import com.renttrack.backend.common.enums.Role;
import org.springframework.security.core.Authentication;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin
public class DashboardController {

    private final PropertyRepository propertyRepository;
    private final TenantRepository tenantRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    /**
     * GET /api/dashboard/stats
     * Returns key dashboard stats used by Dashboard.tsx
     */
    @Transactional(readOnly = true)
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        long totalProperties;
        List<Tenant> activeTenants;

        if (user.getRole() == Role.ADMIN) {
            totalProperties = propertyRepository.count();
            activeTenants = tenantRepository.findActiveTenantsWithActiveLeases(LocalDate.now());
        } else {
            // LANDLORD — scope to own properties only
            totalProperties = propertyRepository.findByLandlordId(user.getId()).size();
            // Filter tenants by this landlord's properties
            activeTenants = tenantRepository.findActiveTenantsWithActiveLeases(LocalDate.now())
                    .stream()
                    .filter(t -> t.getProperty() != null &&
                            t.getProperty().getLandlord() != null &&
                            t.getProperty().getLandlord().getId().equals(user.getId()))
                    .collect(java.util.stream.Collectors.toList());
        }

        long totalTenants = activeTenants.size();

        // Occupied units = number of active tenants (1 tenant per unit)
        long occupiedUnits = totalTenants;

        // Monthly revenue = sum of all active tenants' monthly rent
        BigDecimal monthlyRevenue = activeTenants.stream()
                .filter(t -> t.getMonthlyRent() != null)
                .map(Tenant::getMonthlyRent)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Pending payments (PENDING status)
        long pendingPayments;

        if (user.getRole() == Role.ADMIN) {
            pendingPayments = paymentRepository.findByStatus(
                    com.renttrack.backend.common.enums.PaymentStatus.PENDING
            ).size();
        } else {
            pendingPayments = paymentRepository
                    .findByPropertyLandlordIdAndStatus(
                            user.getId(),
                            com.renttrack.backend.common.enums.PaymentStatus.PENDING
                    ).size();
        }

        // Upcoming renewals: leases expiring within 30 days
        LocalDate in30Days = LocalDate.now().plusDays(30);
        long upcomingRenewals = activeTenants.stream()
                .filter(t -> t.getLeaseEnd() != null && !t.getLeaseEnd().isAfter(in30Days))
                .count();

        Map<String, Object> stats = Map.of(
                "totalProperties", totalProperties,
                "occupiedUnits", occupiedUnits,
                "totalTenants", totalTenants,
                "monthlyRevenue", monthlyRevenue,
                "pendingPayments", pendingPayments,
                "upcomingRenewals", upcomingRenewals
        );

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /**
     * GET /api/dashboard/activity
     * Returns recent activity for the dashboard
     */
    @Transactional(readOnly = true)
    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getActivity() {

        long pendingPayments;

        if (user.getRole() == Role.ADMIN) {
            pendingPayments = paymentRepository.findByStatus(
                    com.renttrack.backend.common.enums.PaymentStatus.PENDING
            ).size();
        } else {
            pendingPayments = paymentRepository
                    .findByPropertyLandlordIdAndStatus(
                            user.getId(),
                            com.renttrack.backend.common.enums.PaymentStatus.PENDING
                    ).size();
        }

        LocalDate in30Days = LocalDate.now().plusDays(30);
        long upcomingRenewals = tenantRepository
                .findActiveTenantsWithActiveLeases(LocalDate.now())
                .stream()
                .filter(t -> t.getLeaseEnd() != null && !t.getLeaseEnd().isAfter(in30Days))
                .count();

        Map<String, Object> activity = Map.of(
                "pendingPayments", pendingPayments,
                "upcomingRenewals", upcomingRenewals
        );

        return ResponseEntity.ok(ApiResponse.success(activity));
    }
}