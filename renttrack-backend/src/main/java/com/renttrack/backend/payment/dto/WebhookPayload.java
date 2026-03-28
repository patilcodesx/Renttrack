package com.renttrack.backend.payment.dto;

import lombok.Data;

@Data
public class WebhookPayload {
    private String event;
    private PayloadEntity payload;

    @Data
    public static class PayloadEntity {
        private PaymentEntity payment;
    }

    @Data
    public static class PaymentEntity {
        private PaymentEntityItem entity;
    }

    @Data
    public static class PaymentEntityItem {
        private String id;
        private String order_id;
        private String status;
        private Long amount;
        private String currency;
    }
}