package com.renttrack.backend.auth.service;
import com.renttrack.backend.common.enums.TenantStatus;
import com.renttrack.backend.tenant.repository.TenantRepository;
import com.renttrack.backend.auth.dto.AuthResponse;
import com.renttrack.backend.auth.dto.LoginRequest;
import com.renttrack.backend.auth.dto.RegisterRequest;
import com.renttrack.backend.auth.entity.PasswordResetToken;
import com.renttrack.backend.auth.jwt.JwtService;
import com.renttrack.backend.auth.repository.PasswordResetTokenRepository;
import com.renttrack.backend.user.entity.User;
import com.renttrack.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.renttrack.backend.scheduler.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import java.time.Instant;
import java.util.Locale;
import java.util.UUID;
import com.renttrack.backend.auth.entity.TenantInviteToken;
import com.renttrack.backend.auth.repository.TenantInviteTokenRepository;
import com.renttrack.backend.common.enums.Role;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final TenantInviteTokenRepository inviteTokenRepository;
    private final TenantRepository tenantRepository;

@Value("${spring.mail.username}")
private String adminEmail;
@Value("${app.frontend.url:http://localhost:5173}")
private String frontendUrl;

    /* ── REGISTER ─────────────────────────────── */
    public AuthResponse register(RegisterRequest req) {

        String email = req.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(req.getName())
                .email(email)
                .password(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole() != null ? req.getRole()
                        : com.renttrack.backend.common.enums.Role.TENANT)
                .enabled(true)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());
        return AuthResponse.from(token, user);
    }

    /* ── LOGIN ────────────────────────────────── */
    public AuthResponse login(LoginRequest req) {

        String email = req.getEmail().trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEnabled()) {
            throw new RuntimeException("Account is disabled");
        }

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail());
        return AuthResponse.from(token, user);
    }

    /* ── FORGOT PASSWORD ──────────────────────── */
    public void forgotPassword(String email) {

        User user = userRepository.findByEmail(
                        email.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        PasswordResetToken token = new PasswordResetToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiresAt(Instant.now().plusSeconds(3600));
        token.setUsed(false);

        passwordResetTokenRepository.save(token);

        String resetLink = frontendUrl + "/reset-password?token=" + token.getToken();
emailService.sendHtml(
    user.getEmail(),
    "RentTrack — Reset Your Password",
    "forgot-password",
    java.util.Map.of(
        "name",      user.getName(),
        "resetLink", resetLink
    )
);
log.info("Password reset email sent to {}", email);  
}

    /* ── CONTACT ADMIN ────────────────────────── */
public void sendContactEmail(String fromEmail, String message) {
    emailService.sendHtml(
        adminEmail,
        "RentTrack: Contact Request from " + fromEmail,
        "contact-admin",
        java.util.Map.of(
            "fromEmail", fromEmail,
            "message",   message
        )
    );
    log.info("Contact request sent from {}", fromEmail);
}

/* ── RESET PASSWORD ───────────────────────── */
@Transactional
    public void resetPassword(String token, String newPassword) {
    PasswordResetToken resetToken = passwordResetTokenRepository
            .findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid reset token"));

    if (resetToken.isUsed()) {
        throw new RuntimeException("Reset token already used");
    }
    if (resetToken.getExpiresAt().isBefore(Instant.now())) {
        throw new RuntimeException("Reset token expired");
    }

    User user = resetToken.getUser();
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);

    resetToken.setUsed(true);
    passwordResetTokenRepository.save(resetToken);

    log.info("Password reset successful for {}", user.getEmail());
}

public String validateInviteToken(String token) {
    TenantInviteToken invite = inviteTokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid or expired invite link"));
    if (invite.isUsed()) throw new RuntimeException("Invite already used");
    if (invite.getExpiresAt().isBefore(Instant.now())) throw new RuntimeException("Invite expired");
    return invite.getEmail();
}

public AuthResponse setPasswordFromInvite(String token, String newPassword) {
    TenantInviteToken invite = inviteTokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid invite link"));
    if (invite.isUsed()) throw new RuntimeException("Invite already used");
    if (invite.getExpiresAt().isBefore(Instant.now())) throw new RuntimeException("Invite expired");

    String email = invite.getEmail().trim().toLowerCase();
    if (userRepository.existsByEmail(email))
        throw new RuntimeException("Account already exists. Please login.");

    User user = User.builder()
            .name(invite.getName())
            .email(email)
            .password(passwordEncoder.encode(newPassword))
            .role(Role.TENANT)
            .enabled(true)
            .build();
    userRepository.save(user);

    invite.setUsed(true);
    inviteTokenRepository.save(invite);

    tenantRepository.findByEmail(email).ifPresent(t -> {
    t.setStatus(TenantStatus.ACTIVE);
    tenantRepository.save(t);
});

    return AuthResponse.from(jwtService.generateToken(email), user);
}
}
