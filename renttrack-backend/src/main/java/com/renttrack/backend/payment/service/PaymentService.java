package com.renttrack.backend.payment.service;
import java.security.MessageDigest;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.renttrack.backend.common.enums.PaymentStatus;
import com.renttrack.backend.common.enums.Role;
import com.renttrack.backend.payment.dto.*;
import com.renttrack.backend.payment.entity.Payment;
import com.renttrack.backend.payment.repository.PaymentRepository;
import com.renttrack.backend.tenant.entity.Tenant;
import com.renttrack.backend.tenant.repository.TenantRepository;
import com.renttrack.backend.user.entity.User;
import com.renttrack.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TenantRepository tenantRepository;
    private final RazorpayClient razorpayClient;
    private final UserRepository userRepository;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency:INR}")
    private String defaultCurrency;

    @Value("${razorpay.webhook.secret}")
private String razorpayWebhookSecret;

    /* =====================================================
       STEP 1 - Create Razorpay Order
    ===================================================== */
   public OrderResponse createOrder(OrderRequest req) throws RazorpayException {

    // 1️⃣ Get currently authenticated user email
    String email = SecurityContextHolder
            .getContext()
            .getAuthentication()
            .getName();

    // 2️⃣ Fetch tenant linked to logged-in user
    Tenant tenant = tenantRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Tenant not found"));

    // 3️⃣ Determine currency
    String currency = req.getCurrency() != null
            ? req.getCurrency()
            : defaultCurrency;

    // 4️⃣ Convert amount to paise (Razorpay expects smallest currency unit)
    int amountInPaise = req.getAmount()
            .multiply(BigDecimal.valueOf(100))
            .intValue();

    // 5️⃣ Build Razorpay order request
    JSONObject orderRequest = new JSONObject();
    orderRequest.put("amount", amountInPaise);
    orderRequest.put("currency", currency);
    orderRequest.put("receipt",
            "rcpt_" + UUID.randomUUID().toString().substring(0, 8));

    orderRequest.put("notes", new JSONObject()
            .put("tenantId", tenant.getId().toString())
            .put("tenantName", tenant.getFullName()));

    // 6️⃣ Create Razorpay order
    Order razorpayOrder = razorpayClient.orders.create(orderRequest);
    String razorpayOrderId = razorpayOrder.get("id");

    // 7️⃣ Save payment record in DB (PENDING)
    Payment payment = Payment.builder()
            .razorpayOrderId(razorpayOrderId)
            .amount(req.getAmount())
            .currency(currency)
            .description(
                    req.getDescription() != null
                            ? req.getDescription()
                            : "Rent for " + tenant.getUnitNumber()
            )
            .dueDate(
                    req.getDueDate() != null
                            ? req.getDueDate()
                            : LocalDate.now()
            )
            .status(PaymentStatus.PENDING)
            .tenant(tenant)
            .build();

    Payment saved = paymentRepository.save(payment);

    // 8️⃣ Return response to frontend
    return OrderResponse.builder()
            .razorpayOrderId(razorpayOrderId)
            .razorpayKeyId(razorpayKeyId)
            .amount(req.getAmount())
            .currency(currency)
            .description(payment.getDescription())
            .paymentId(saved.getId())
            .tenantName(tenant.getFullName())
            .tenantEmail(tenant.getEmail())
            .build();
}

    /* =====================================================
   WEBHOOK HANDLER - called by Razorpay server
===================================================== */
public void handleWebhook(String rawBody, String signature) throws Exception {

    // 1. Verify HMAC signature using webhook secret
    Mac mac = Mac.getInstance("HmacSHA256");
    SecretKeySpec key = new SecretKeySpec(
            razorpayWebhookSecret.getBytes(), "HmacSHA256");
    mac.init(key);
    byte[] hash = mac.doFinal(rawBody.getBytes());
    String generated = HexFormat.of().formatHex(hash);

    if (!MessageDigest.isEqual(generated.getBytes(), signature.getBytes())){
        throw new RuntimeException("Invalid webhook signature");
    }

    // 2. Parse payload
    ObjectMapper mapper = new ObjectMapper();
    WebhookPayload payload = mapper.readValue(rawBody, WebhookPayload.class);

    String event = payload.getEvent();
    if (payload.getPayload() == null
            || payload.getPayload().getPayment() == null
            || payload.getPayload().getPayment().getEntity() == null) {
        log.warn("Webhook received with empty payload, event={}", event);
        return;
    }

    String orderId = payload.getPayload().getPayment().getEntity().getOrder_id();

    // 3. Handle event types
    switch (event) {
        case "payment.captured" -> {
            paymentRepository.findByRazorpayOrderId(orderId).ifPresent(p -> {
                if (p.getStatus() != PaymentStatus.PAID && p.getStatus() != PaymentStatus.LATE) {
                    p.setStatus(PaymentStatus.PAID);
                    p.setPaidAt(LocalDate.now());
                    paymentRepository.save(p);
                    log.info("Webhook: payment.captured — orderId={}", orderId);
                }
            });
        }
        case "payment.failed" -> {
            paymentRepository.findByRazorpayOrderId(orderId).ifPresent(p -> {
                p.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(p);
                log.info("Webhook: payment.failed — orderId={}", orderId);
            });
        }
        default -> log.info("Webhook: unhandled event={}", event);
    }
}

    /* =====================================================
       STEP 2 - Verify and Confirm Payment
    ===================================================== */
    public PaymentResponse verifyAndConfirm(PaymentRequest req) {

       
        Payment payment = paymentRepository
                .findByRazorpayOrderId(req.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment order not found"));

         if (payment.getStatus() == PaymentStatus.PAID) {
    return toResponse(payment);
}
        boolean valid = verifySignature(
                req.getRazorpayOrderId(),
                req.getRazorpayPaymentId(),
                req.getRazorpaySignature());

        if (!valid) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new RuntimeException("Payment signature verification failed");
        }

        LocalDate today = LocalDate.now();
        PaymentStatus finalStatus = today.isAfter(payment.getDueDate())
                ? PaymentStatus.LATE
                : PaymentStatus.PAID;

        payment.setRazorpayPaymentId(req.getRazorpayPaymentId());
        payment.setRazorpaySignature(req.getRazorpaySignature());
        payment.setStatus(finalStatus);
        payment.setPaidAt(today);

        return toResponse(paymentRepository.save(payment));
    }

    /* =====================================================
       RAZORPAY SIGNATURE VERIFICATION
    ===================================================== */
    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(razorpayKeySecret.getBytes(), "HmacSHA256");
            mac.init(key);
            byte[] hash = mac.doFinal(data.getBytes());
            String generated = HexFormat.of().formatHex(hash);
            return generated.equals(signature);
        } catch (Exception e) {
            log.error("Signature verification error", e);
            return false;
        }
    }

    /* =====================================================
       GET MY PAYMENTS - for authenticated tenant
       Called by: GET /payments/me
    ===================================================== */
    public List<PaymentResponse> getMyPayments(String email) {
        Tenant tenant = tenantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No tenant record for this account"));

        return paymentRepository.findByTenantIdOrderByDueDateDesc(tenant.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /* =====================================================
       GET PAYMENT HISTORY - by tenant id
    ===================================================== */
    public List<PaymentResponse> getByTenant(UUID tenantId) {
        return paymentRepository
                .findByTenantIdOrderByDueDateDesc(tenantId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /* =====================================================
       GET ALL PAYMENTS (role-scoped)
    ===================================================== */
    public List<PaymentResponse> getAll() {
        User user = getCurrentUser();

        if (user.getRole() == Role.ADMIN) {
            return paymentRepository.findAll()
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        if (user.getRole() == Role.LANDLORD) {
            return paymentRepository
                    .findByPropertyLandlordId(user.getId())
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        if (user.getRole() == Role.TENANT) {
            return paymentRepository
                    .findByTenantUserId(user.getId())
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        throw new RuntimeException("Access denied");
    }

    /* =====================================================
       GET BY PROPERTY
    ===================================================== */
    public List<PaymentResponse> getByProperty(UUID propertyId) {
        User user = getCurrentUser();

        if (user.getRole() == Role.ADMIN) {
            return paymentRepository.findByPropertyId(propertyId)
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        if (user.getRole() == Role.LANDLORD) {
            boolean ownsProperty = paymentRepository.existsByPropertyIdAndLandlordId(
                    propertyId, user.getId());
            if (!ownsProperty) {
                throw new AccessDeniedException("Access denied");
            }
            return paymentRepository.findByPropertyId(propertyId)
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        throw new AccessDeniedException("Access denied");
    }

    /* =====================================================
       MARK OVERDUE - called by Quartz Scheduler daily
    ===================================================== */
    public void markOverduePayments() {
        List<Payment> overdue = paymentRepository.findOverduePayments(LocalDate.now());
        overdue.forEach(p -> p.setStatus(PaymentStatus.LATE));
        paymentRepository.saveAll(overdue);
        log.info("Marked {} payments as LATE", overdue.size());
    }

    /* =====================================================
       MAPPER
    ===================================================== */
    private PaymentResponse toResponse(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .razorpayOrderId(p.getRazorpayOrderId())
                .razorpayPaymentId(p.getRazorpayPaymentId())
                .amount(p.getAmount())
                .currency(p.getCurrency())
                .description(p.getDescription())
                .dueDate(p.getDueDate())
                .paidAt(p.getPaidAt())
                .status(p.getStatus())
                .month(p.getDueDate() != null
                        ? p.getDueDate().format(DateTimeFormatter.ofPattern("MMM yyyy"))
                        : "")
                .tenantId(p.getTenant().getId())
                .tenantName(p.getTenant().getFullName())
                .tenantEmail(p.getTenant().getEmail())
                .unitNumber(p.getTenant().getUnitNumber())
                .createdAt(p.getCreatedAt())
                .build();
    }


    public void generateRentForTenant(java.util.UUID tenantId, int month, int year) {

        User user = getCurrentUser();

        if (user.getRole() != Role.LANDLORD && user.getRole() != Role.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Only landlord can generate rent");
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        if (user.getRole() == Role.LANDLORD &&
                !tenant.getProperty().getLandlord().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Not your tenant");
        }

        boolean exists = paymentRepository
                .existsByTenantIdAndBillingMonthAndBillingYear(tenantId, month, year);

        if (exists) {
            throw new RuntimeException("Rent already generated for this month");
        }

        Payment payment = Payment.builder()
                .tenant(tenant)
                .amount(tenant.getMonthlyRent())
                .currency(defaultCurrency)
                .dueDate(java.time.LocalDate.of(year, month, 5))
                .billingMonth(month)
                .billingYear(year)
                .description("Monthly Rent - " + month + "/" + year)
                .status(PaymentStatus.PENDING)
                .build();

        paymentRepository.save(payment);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
