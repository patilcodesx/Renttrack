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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder encoder;

    /* ======================
       REGISTER
    ====================== */
    public void register(RegisterRequest req) {

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .role(Role.valueOf(req.getRole()))
                .enabled(true)
                .build();

        userRepository.save(user);
    }

    /* ======================
       LOGIN
    ====================== */
    public AuthResponse login(LoginRequest req) {

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token, user);
    }

    /* ======================
       FORGOT PASSWORD
    ====================== */
    public void forgotPassword(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PasswordResetToken token = new PasswordResetToken();
        token.setToken(UUID.randomUUID().toString());
        token.setUser(user);
        token.setExpiresAt(Instant.now().plusSeconds(900)); // 15 min

        tokenRepository.save(token);

        // Later this will be sent via email
        System.out.println("RESET TOKEN = " + token.getToken());
    }
}
