package com.renttrack.backend.scheduler.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name:RentTrack}")
    private String appName;

    /* =====================================================
       SEND HTML EMAIL (async — non blocking)
    ===================================================== */
    @Async
    public void sendHtml(
            String to,
            String subject,
            String templateName,
            Map<String, Object> variables
    ) {
        try {
            // build Thymeleaf context
            Context ctx = new Context();
            ctx.setVariables(variables);
            ctx.setVariable("appName", appName);

            // process template
            String html = templateEngine
                    .process("email/" + templateName, ctx);

            // build MIME message
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message, true, "UTF-8"
            );

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);

            log.info("Email sent to {} | subject: {}", to, subject);

        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    /* =====================================================
       CONVENIENCE METHODS
    ===================================================== */
    @Async
    public void sendRentReminder(
            String to,
            String tenantName,
            String amount,
            String dueDate,
            String unitNumber,
            String paymentLink
    ) {
        sendHtml(
                to,
                "Rent Reminder — Payment Due on " + dueDate,
                "rent-reminder",
                Map.of(
                        "tenantName",  tenantName,
                        "amount",      amount,
                        "dueDate",     dueDate,
                        "unitNumber",  unitNumber,
                        "paymentLink", paymentLink
                )
        );
    }

    @Async
    public void sendOverdueNotice(
            String to,
            String tenantName,
            String amount,
            String dueDate,
            String daysLate,
            String paymentLink
    ) {
        sendHtml(
                to,
                "OVERDUE: Rent Payment Required",
                "overdue-notice",
                Map.of(
                        "tenantName",  tenantName,
                        "amount",      amount,
                        "dueDate",     dueDate,
                        "daysLate",    daysLate,
                        "paymentLink", paymentLink
                )
        );
    }

    @Async
    public void sendLeaseExpiryNotice(
            String to,
            String tenantName,
            String expiryDate,
            String daysLeft,
            String unitNumber
    ) {
        sendHtml(
                to,
                "Lease Expiry Notice — " + daysLeft + " days remaining",
                "lease-expiry",
                Map.of(
                        "tenantName",  tenantName,
                        "expiryDate",  expiryDate,
                        "daysLeft",    daysLeft,
                        "unitNumber",  unitNumber
                )
        );
    }
}