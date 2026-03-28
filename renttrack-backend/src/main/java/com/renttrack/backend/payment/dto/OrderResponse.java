package com.renttrack.backend.payment.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class OrderResponse {

    // returned to frontend to open Razorpay checkout
    private String razorpayOrderId;
    private String razorpayKeyId;
    private BigDecimal amount;
    private String currency;
    private String description;

    // internal payment record id
    private UUID paymentId;
    private String tenantName;
    private String tenantEmail;
}