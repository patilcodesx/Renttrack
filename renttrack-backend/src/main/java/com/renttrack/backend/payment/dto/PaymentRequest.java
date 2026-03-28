package com.renttrack.backend.payment.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class PaymentRequest {

    // sent by frontend after Razorpay checkout success
    private UUID paymentId;                 // our DB payment id
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}