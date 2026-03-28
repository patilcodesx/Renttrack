package com.renttrack.backend.payment.repository;

import com.renttrack.backend.common.enums.PaymentStatus;
import com.renttrack.backend.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    java.util.List<com.renttrack.backend.payment.entity.Payment> 
    findByPropertyLandlordIdAndStatus(
        java.util.UUID landlordId,
        com.renttrack.backend.common.enums.PaymentStatus status
    );

    boolean existsByTenantIdAndBillingMonthAndBillingYear(
            java.util.UUID tenantId,
            Integer billingMonth,
            Integer billingYear
    );

    List<Payment> findByTenantIdOrderByDueDateDesc(UUID tenantId);

    List<Payment> findByStatus(PaymentStatus status);

    Optional<Payment> findByRazorpayOrderId(String orderId);

    @Query("""
        SELECT p FROM Payment p
        WHERE p.status = 'PENDING'
        AND p.dueDate < :today
    """)
    List<Payment> findOverduePayments(@Param("today") LocalDate today);  // ✅ @Param added

    @Query("""
        SELECT p FROM Payment p
        WHERE p.tenant.id = :tenantId
        ORDER BY p.dueDate DESC
    """)
    List<Payment> findPaymentHistoryByTenant(@Param("tenantId") UUID tenantId);  // ✅ @Param added

    @Query("""
        SELECT p FROM Payment p
        WHERE p.tenant.property.id = :propertyId
        ORDER BY p.dueDate DESC
    """)
    List<Payment> findByPropertyId(@Param("propertyId") UUID propertyId);  // ✅ @Param added
 
@Query("""
    SELECT p FROM Payment p
    WHERE p.tenant.user.id = :userId
""")
List<Payment> findByTenantUserId(@Param("userId") UUID userId);
    
   @Query("""
    SELECT p FROM Payment p
    WHERE p.tenant.property.landlord.id = :landlordId
    ORDER BY p.dueDate DESC
""")
List<Payment> findByPropertyLandlordId(@Param("landlordId") UUID landlordId);

@Query("""
    SELECT COUNT(p) > 0 FROM Payment p
    WHERE p.tenant.property.id = :propertyId
    AND p.tenant.property.landlord.id = :landlordId
""")
boolean existsByPropertyIdAndLandlordId(
    @Param("propertyId") UUID propertyId,
    @Param("landlordId") UUID landlordId
);
}