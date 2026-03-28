package com.renttrack.backend.scheduler.job;

import com.renttrack.backend.scheduler.service.EmailService;
import com.renttrack.backend.tenant.entity.Tenant;
import com.renttrack.backend.tenant.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class RentReminderJob implements Job {

    private final TenantRepository tenantRepository;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void execute(JobExecutionContext context) {

        log.info("RentReminderJob started — {}",
                LocalDate.now());

        // Due date = 1st of next month
        LocalDate dueDate = LocalDate.now()
                .withDayOfMonth(1)
                .plusMonths(1);

        String dueDateStr = dueDate.format(
                DateTimeFormatter.ofPattern("dd MMM yyyy")
        );

        // Get all active tenants with active leases
        List<Tenant> tenants = tenantRepository
                .findActiveTenantsWithActiveLeases(LocalDate.now());

        log.info("Sending rent reminders to {} tenants", tenants.size());

        int month = LocalDate.now().getMonthValue();
        int year = LocalDate.now().getYear();

        tenants.forEach(tenant -> {
            try {
                boolean exists = paymentRepository
                        .existsByTenantIdAndBillingMonthAndBillingYear(
                                tenant.getId(), month, year);

                if (!exists) {
                    Payment payment = Payment.builder()
                            .tenant(tenant)
                            .amount(tenant.getMonthlyRent())
                            .currency("INR")
                            .dueDate(LocalDate.of(year, month, 5))
                            .billingMonth(month)
                            .billingYear(year)
                            .status(com.renttrack.backend.common.enums.PaymentStatus.PENDING)
                            .description("Monthly Rent - " + month + "/" + year)
                            .build();

                    paymentRepository.save(payment);
                }

                String amount = tenant.getMonthlyRent() != null
                        ? "₹" + tenant.getMonthlyRent().toPlainString()
                        : "as per agreement";

                emailService.sendRentReminder(
                        tenant.getEmail(),
                        tenant.getFullName(),
                        amount,
                        "05 " + LocalDate.now().getMonth(),
                        tenant.getUnitNumber() != null
                                ? tenant.getUnitNumber()
                                : "N/A",
                        frontendUrl + "/payments"
                );

            } catch (Exception e) {
                log.error("Failed rent generation for tenant {}: {}",
                        tenant.getId(), e.getMessage());
            }
        });

        log.info("RentReminderJob completed — {} emails sent",
                tenants.size());
    }
}