package com.renttrack.backend.payment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.renttrack.backend.common.entity.BaseEntity;
import com.renttrack.backend.common.enums.PaymentStatus;
import com.renttrack.backend.tenant.entity.Tenant;
import jakarta.persistence.*;
import jakarta.persistence.UniqueConstraint;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
    name = "payments",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_tenant_month_year",
            columnNames = {"tenant_id", "billingMonth", "billingYear"}
        )
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true)
    private String razorpayOrderId;

    private String razorpayPaymentId;
    private String razorpaySignature;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String currency;

    private String description;

    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private Integer billingMonth;

    @Column(nullable = false)
    private Integer billingYear;


    private LocalDate paidAt;

    @Column(nullable = false)
    private Integer billingMonth;

    @Column(nullable = false)
    private Integer billingYear;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    @JsonIgnore
    private Tenant tenant;
}
