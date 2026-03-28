package com.renttrack.backend.payment.dto;

import com.renttrack.backend.common.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class PaymentResponse {

    private UUID id;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private BigDecimal amount;
    private String currency;
    private String description;
    private LocalDate dueDate;
    private LocalDate paidAt;
    private PaymentStatus status;
    private String month;

    // tenant info
    private UUID tenantId;
    private String tenantName;
    private String tenantEmail;
    private String unitNumber;

    private LocalDateTime createdAt;
}
