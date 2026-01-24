package com.renttrack.backend.auth.service;

import com.renttrack.backend.auth.dto.AuthResponse;
import com.renttrack.backend.auth.dto.LoginRequest;
import com.renttrack.backend.auth.dto.RegisterRequest;
import com.renttrack.backend.auth.entity.PasswordResetToken;
import com.renttrack.backend.auth.jwt.JwtService;
import com.renttrack.backend.auth.repository.PasswordResetTokenRepository;
import com.renttrack.backend.common.enums.Role;
import com.renttrack.backend.user.entity.User;
import com.renttrack.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;

    /* =====================================================
       REGISTER
    ===================================================== */
    public void register(RegisterRequest req) {

        String email =
                req.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered");
        }

        Role role;
        try {
            role = Role.valueOf(req.getRole().toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Invalid role");
        }

        User user = User.builder()
                .name(req.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(req.getPassword()))
                .role(role)
                .enabled(true)
                .build();

        userRepository.save(user);
    }

    /* =====================================================
       LOGIN
    ===================================================== */
    public AuthResponse login(LoginRequest req) {

        String email =
                req.getEmail().trim().toLowerCase(Locale.ROOT);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Invalid credentials")
                );

        if (!user.isEnabled()) {
            throw new RuntimeException("Account disabled");
        }

        if (!passwordEncoder.matches(
                req.getPassword(),
                user.getPassword()
        )) {
            throw new RuntimeException("Invalid credentials");
        }

        String token =
                jwtService.generateToken(user.getEmail());

        // 🔒 DO NOT SEND PASSWORD TO FRONTEND
        user.setPassword(null);

        return new AuthResponse(token, user);
    }

    /* =====================================================
       FORGOT PASSWORD
    ===================================================== */
    public void forgotPassword(String email) {

        User user = userRepository.findByEmail(
                        email.trim().toLowerCase()
                )
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        PasswordResetToken token = new PasswordResetToken();

        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiresAt(
                Instant.now().plusSeconds(900)
        ); // 15 minutes
        token.setUsed(false);

        tokenRepository.save(token);

        // TODO: email service later
        System.out.println("PASSWORD RESET TOKEN = " + token.getToken());
    }
}
