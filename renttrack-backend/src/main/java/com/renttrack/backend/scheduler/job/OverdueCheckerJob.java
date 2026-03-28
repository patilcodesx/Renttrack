package com.renttrack.backend.scheduler.job;

import com.renttrack.backend.payment.service.PaymentService;
import com.renttrack.backend.payment.entity.Payment;
import com.renttrack.backend.payment.repository.PaymentRepository;
import com.renttrack.backend.scheduler.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OverdueCheckerJob implements Job {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void execute(JobExecutionContext context) {

        log.info("OverdueCheckerJob started — {}", LocalDate.now());

        // 1. Mark pending payments as LATE in DB
        List<Payment> overduePayments = paymentRepository.findOverduePayments(LocalDate.now());

        overduePayments.forEach(p -> {
            p.setStatus(com.renttrack.backend.common.enums.PaymentStatus.LATE);
        });
        paymentRepository.saveAll(overduePayments);

        // 2. Send overdue emails
        List<Payment> overduePayments = paymentRepository
                .findOverduePayments(LocalDate.now());

        overduePayments.forEach(payment -> {
            try {
                long daysLate = ChronoUnit.DAYS.between(
                        payment.getDueDate(), LocalDate.now()
                );

                String dueDateStr = payment.getDueDate().format(
                        DateTimeFormatter.ofPattern("dd MMM yyyy")
                );

                emailService.sendOverdueNotice(
                        payment.getTenant().getEmail(),
                        payment.getTenant().getFullName(),
                        "₹" + payment.getAmount().toPlainString(),
                        dueDateStr,
                        String.valueOf(daysLate),
                        frontendUrl + "/payments"
                );

            } catch (Exception e) {
                log.error("Failed overdue notice for payment {}: {}",
                        payment.getId(), e.getMessage());
            }
        });

        log.info("OverdueCheckerJob completed — {} notices sent",
                overduePayments.size());
    }
}