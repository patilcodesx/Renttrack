package com.renttrack.backend.scheduler.job;

import com.renttrack.backend.scheduler.service.EmailService;
import com.renttrack.backend.tenant.entity.Tenant;
import com.renttrack.backend.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class LeaseExpiryJob implements Job {

    private final TenantRepository tenantRepository;
    private final EmailService emailService;

    // Warn when lease expires within 30 days
    private static final int EXPIRY_WARN_DAYS = 30;

    @Override
    public void execute(JobExecutionContext context) {

        log.info("LeaseExpiryJob started — {}", LocalDate.now());

        LocalDate today = LocalDate.now();
        LocalDate warningThreshold = today.plusDays(EXPIRY_WARN_DAYS);

        List<Tenant> tenants = tenantRepository
                .findActiveTenantsWithActiveLeases(today);

        tenants.stream()
                .filter(t -> t.getLeaseEnd() != null)
                .filter(t -> !t.getLeaseEnd().isAfter(warningThreshold))
                .forEach(tenant -> {
                    try {
                        long daysLeft = ChronoUnit.DAYS.between(
                                today, tenant.getLeaseEnd()
                        );

                        String expiryDateStr = tenant.getLeaseEnd()
                                .format(DateTimeFormatter
                                        .ofPattern("dd MMM yyyy"));

                        emailService.sendLeaseExpiryNotice(
                                tenant.getEmail(),
                                tenant.getFullName(),
                                expiryDateStr,
                                String.valueOf(daysLeft),
                                tenant.getUnitNumber() != null
                                        ? tenant.getUnitNumber()
                                        : "N/A"
                        );

                        log.info("Lease expiry notice sent to {}",
                                tenant.getEmail());

                    } catch (Exception e) {
                        log.error("Failed lease notice for tenant {}: {}",
                                tenant.getId(), e.getMessage());
                    }
                });

        log.info("LeaseExpiryJob completed");
    }
}