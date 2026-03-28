package com.renttrack.backend.common.enums;

public enum PaymentStatus {
    PENDING,    // order created, payment not done
    PAID,       // razorpay confirmed
    FAILED,     // payment failed
    LATE,       // paid after due date
    REFUNDED    // refund issued
}