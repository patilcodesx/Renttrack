package com.renttrack.backend.tenant.service;

import com.renttrack.backend.auth.entity.TenantInviteToken;
import com.renttrack.backend.auth.repository.TenantInviteTokenRepository;
import com.renttrack.backend.common.enums.TenantStatus;
import com.renttrack.backend.property.entity.Property;
import com.renttrack.backend.property.repository.PropertyRepository;
import com.renttrack.backend.scheduler.service.EmailService;
import com.renttrack.backend.tenant.dto.TenantRequest;
import com.renttrack.backend.tenant.dto.TenantResponse;
import com.renttrack.backend.tenant.entity.Tenant;
import com.renttrack.backend.tenant.repository.TenantRepository;
import com.renttrack.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TenantService {

    private final TenantRepository tenantRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final TenantInviteTokenRepository inviteTokenRepository;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /* =====================================================
       CREATE — saves tenant AND sends invite email
    ===================================================== */
    public TenantResponse create(TenantRequest req) {

        String email = req.getEmail().trim().toLowerCase();

       if (tenantRepository.existsByEmailAndPropertyId(email, req.getPropertyId())) {
    throw new RuntimeException("Tenant already exists for this property");
}

        Property property = null;
        if (req.getPropertyId() != null) {
            property = propertyRepository.findById(req.getPropertyId())
                    .orElseThrow(() -> new RuntimeException("Property not found"));
        }

        Tenant tenant = Tenant.builder()
                .fullName(req.getFullName())
                .email(email)
                .phone(req.getPhone())
                .unitNumber(req.getUnitNumber())
                .monthlyRent(req.getMonthlyRent())
                .leaseStart(req.getLeaseStart())
                .leaseEnd(req.getLeaseEnd())
                .extractedIdNumber(req.getExtractedIdNumber())
                .extractedAddress(req.getExtractedAddress())
                .extractedDob(req.getExtractedDob())
                .status(TenantStatus.PENDING)
                .property(property)
                .build();

        // Link existing user if present
        userRepository.findByEmail(email).ifPresent(tenant::setUser);

        Tenant saved = tenantRepository.save(tenant);

        // Send invite only if no user account exists
        if (saved.getUser() == null) {
            sendTenantInvite(saved.getEmail(), saved.getFullName());
        }

        return TenantResponse.from(saved);
    }

    /* =====================================================
       SEND INVITE EMAIL
    ===================================================== */
    private void sendTenantInvite(String email, String name) {
        try {
            inviteTokenRepository.deleteByEmail(email);

            String rawToken = UUID.randomUUID().toString();

            TenantInviteToken invite = new TenantInviteToken();
            invite.setToken(rawToken);
            invite.setEmail(email);
            invite.setName(name);
            invite.setExpiresAt(Instant.now().plusSeconds(7 * 24 * 60 * 60)); // 7 days
            invite.setUsed(false);

            inviteTokenRepository.save(invite);

            String link = frontendUrl + "/set-password?token=" + rawToken;

            emailService.sendHtml(
                    email,
                    "You've been added to RentTrack — Set your password",
                    "tenant-invite",
                    Map.of(
                            "name", name,
                            "link", link,
                            "appName", "RentTrack"
                    )
            );

            log.info("Tenant invite sent to {}", email);

        } catch (Exception e) {
            // Do NOT fail tenant creation if email fails
            log.error("Failed to send invite email to {}: {}", email, e.getMessage(), e);
        }
    }

    /* =====================================================
       FIND BY PROPERTY
    ===================================================== */
    @Transactional(readOnly = true)
    public List<TenantResponse> findByProperty(UUID propertyId) {
        return tenantRepository.findByPropertyId(propertyId)
                .stream()
                .map(TenantResponse::from)
                .collect(Collectors.toList());
    }

    /* =====================================================
       SEARCH
    ===================================================== */
    @Transactional(readOnly = true)
    public List<TenantResponse> search(String query) {
        return tenantRepository.searchByNameOrEmail(query)
                .stream()
                .map(TenantResponse::from)
                .collect(Collectors.toList());
    }

    /* =====================================================
       UPDATE STATUS
    ===================================================== */
    public TenantResponse updateStatus(UUID id, TenantStatus status) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        tenant.setStatus(status);
        return TenantResponse.from(tenantRepository.save(tenant));
    }

    /* =====================================================
       UPDATE OCR FIELDS
    ===================================================== */
    public void updateOcrFields(
            UUID tenantId,
            String filePath,
            String idNumber,
            String address,
            String dob
    ) {
        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        tenant.setIdDocumentPath(filePath);
        tenant.setExtractedIdNumber(idNumber);
        tenant.setExtractedAddress(address);
        tenant.setExtractedDob(dob);

        tenantRepository.save(tenant);
    }

    /* =====================================================
       FIND ALL
    ===================================================== */
    @Transactional(readOnly = true)
    public List<TenantResponse> findAll() {
        return tenantRepository.findAllWithProperty() // 🚀 prevents N+1
                .stream()
                .map(TenantResponse::from)
                .collect(Collectors.toList());
    }

    /* =====================================================
       FIND BY ID
    ===================================================== */
    @Transactional(readOnly = true)
    public TenantResponse findById(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        return TenantResponse.from(tenant);
    }

    /* =====================================================
       UPDATE
    ===================================================== */
    public TenantResponse update(UUID id, TenantRequest req) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));

        if (req.getFullName() != null) tenant.setFullName(req.getFullName());
        if (req.getPhone() != null) tenant.setPhone(req.getPhone());
        if (req.getUnitNumber() != null) tenant.setUnitNumber(req.getUnitNumber());
        if (req.getMonthlyRent() != null) tenant.setMonthlyRent(req.getMonthlyRent());
        if (req.getLeaseStart() != null) tenant.setLeaseStart(req.getLeaseStart());
        if (req.getLeaseEnd() != null) tenant.setLeaseEnd(req.getLeaseEnd());

        if (req.getPropertyId() != null) {
            Property property = propertyRepository.findById(req.getPropertyId())
                    .orElseThrow(() -> new RuntimeException("Property not found"));
            tenant.setProperty(property);
        }

        return TenantResponse.from(tenantRepository.save(tenant));
    }

    /* =====================================================
       DELETE
    ===================================================== */
    public void delete(UUID id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found"));
        tenantRepository.delete(tenant);
    }
}