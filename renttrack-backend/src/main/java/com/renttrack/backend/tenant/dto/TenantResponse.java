package com.renttrack.backend.tenant.dto;

import com.renttrack.backend.common.enums.TenantStatus;
import com.renttrack.backend.tenant.entity.Tenant;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TenantResponse {

    private UUID id;
    private String fullName;
    private String email;
    private String phone;
    private String unitNumber;

    private BigDecimal monthlyRent;
    private LocalDate leaseStart;
    private LocalDate leaseEnd;

    private TenantStatus status;

    // property info
    private UUID propertyId;
    private String propertyTitle;
    private String propertyAddress;

    // OCR fields
    private String idDocumentPath;
    private String extractedIdNumber;
    private String extractedAddress;
    private String extractedDob;

    private LocalDateTime createdAt;

    public static TenantResponse from(Tenant t) {
        if (t == null) return null;

        return TenantResponse.builder()
                .id(t.getId())
                .fullName(t.getFullName())
                .email(t.getEmail())
                .phone(t.getPhone())
                .unitNumber(t.getUnitNumber())
                .monthlyRent(t.getMonthlyRent())
                .leaseStart(t.getLeaseStart())
                .leaseEnd(t.getLeaseEnd())
                .status(t.getStatus())
                .propertyId(t.getProperty() != null ? t.getProperty().getId() : null)
                .propertyTitle(t.getProperty() != null ? t.getProperty().getTitle() : null)
                .propertyAddress(t.getProperty() != null ? t.getProperty().getAddress() : null)
                .idDocumentPath(t.getIdDocumentPath())
                .extractedIdNumber(t.getExtractedIdNumber())
                .extractedAddress(t.getExtractedAddress())
                .extractedDob(t.getExtractedDob())
                .createdAt(t.getCreatedAt())
                .build();
    }
}