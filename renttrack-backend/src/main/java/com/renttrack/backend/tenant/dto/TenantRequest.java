package com.renttrack.backend.tenant.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TenantRequest {

    private String fullName;
    private String email;
    private String phone;
    private String unitNumber;
    private BigDecimal monthlyRent;
    private LocalDate leaseStart;
    private LocalDate leaseEnd;
    private UUID propertyId;

    // OCR pre-filled fields
    private String extractedIdNumber;
    private String extractedAddress;
    private String extractedDob;
}
