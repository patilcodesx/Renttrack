package com.renttrack.backend.payment.controller;
import org.springframework.http.HttpStatus;
import com.razorpay.RazorpayException;
import com.renttrack.backend.common.response.ApiResponse;
import com.renttrack.backend.payment.dto.*;
import com.renttrack.backend.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController

    }

@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/generate/{tenantId}")
    public ResponseEntity<?> generateRent(
            @PathVariable UUID tenantId,
            @RequestParam int month,
            @RequestParam int year) {

        paymentService.generateRentForTenant(tenantId, month, year);
        return ResponseEntity.ok("Rent generated");
    }


    ===================================================== */
    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @RequestBody OrderRequest req) throws RazorpayException {
        return ResponseEntity.ok(
                ApiResponse.success("Order created", paymentService.createOrder(req)));
    }


/* =====================================================
   RAZORPAY WEBHOOK - server-to-server callback
   Must be PUBLIC (no JWT) - configured in SecurityConfig
===================================================== */
@PostMapping("/webhook")
public ResponseEntity<String> handleWebhook(
        @RequestBody String rawBody,
        @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {

    if (signature == null) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Missing signature");
    }

    try {
        paymentService.handleWebhook(rawBody, signature);
        return ResponseEntity.ok("OK");
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
    }
}
    /* =====================================================
       STEP 2 - Verify after Razorpay checkout
    ===================================================== */
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<PaymentResponse>> verify(
            @RequestBody PaymentRequest req) {
        return ResponseEntity.ok(
                ApiResponse.success("Payment verified successfully",
                        paymentService.verifyAndConfirm(req)));
    }

    /* =====================================================
       GET MY PAYMENTS - for authenticated tenant
    ===================================================== */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getMyPayments(
            Authentication authentication) {
        return ResponseEntity.ok(
                ApiResponse.success(paymentService.getMyPayments(authentication.getName())));
    }

    /* =====================================================
       GET ALL PAYMENTS - admin/landlord view
    ===================================================== */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getAll()));
    }

    /* =====================================================
       GET BY TENANT - used by Tenants.tsx panel
    ===================================================== */
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getByTenant(
            @PathVariable UUID tenantId) {
        return ResponseEntity.ok(
                ApiResponse.success(paymentService.getByTenant(tenantId)));
    }

    /* =====================================================
       GET BY PROPERTY
    ===================================================== */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getByProperty(
            @PathVariable UUID propertyId) {
        return ResponseEntity.ok(
                ApiResponse.success(paymentService.getByProperty(propertyId)));
    }
}
