package com.renttrack.backend.tenant.repository;

import com.renttrack.backend.common.enums.TenantStatus;
import com.renttrack.backend.tenant.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TenantRepository extends JpaRepository<Tenant, UUID> {

    List<Tenant> findByPropertyId(UUID propertyId);

    Optional<Tenant> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Tenant> findByStatus(TenantStatus status);

    @Query("""
        SELECT t FROM Tenant t
        WHERE t.status = 'ACTIVE'
        AND t.leaseEnd >= :today
    """)
    List<Tenant> findActiveTenantsWithActiveLeases(@Param("today") LocalDate today);  // ✅ @Param added

    @Query("""
        SELECT t FROM Tenant t
        WHERE LOWER(t.fullName) LIKE LOWER(CONCAT('%', :query, '%'))
        OR LOWER(t.email) LIKE LOWER(CONCAT('%', :query, '%'))
    """)
    List<Tenant> searchByNameOrEmail(@Param("query") String query);  // ✅ @Param added
    
    @Query("""
    SELECT t FROM Tenant t
    LEFT JOIN FETCH t.property
""")
List<Tenant> findAllWithProperty();
    boolean existsByEmailAndPropertyId(String email, java.util.UUID propertyId);
}