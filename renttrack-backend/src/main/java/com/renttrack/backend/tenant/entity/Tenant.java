package com.renttrack.backend.tenant.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.renttrack.backend.common.entity.BaseEntity;
import com.renttrack.backend.common.enums.TenantStatus;
import com.renttrack.backend.property.entity.Property;
import com.renttrack.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tenants")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tenant extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    private String phone;
    private String unitNumber;
    private BigDecimal monthlyRent;
    private LocalDate leaseStart;
    private LocalDate leaseEnd;

    // OCR extracted fields
    private String idDocumentPath;
    private String extractedIdNumber;
    private String extractedAddress;
    private String extractedDob;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TenantStatus status = TenantStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    @JsonIgnore
    private Property property;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}
