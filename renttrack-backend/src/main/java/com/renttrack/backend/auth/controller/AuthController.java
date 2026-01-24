package com.renttrack.backend.auth.controller;

import com.renttrack.backend.auth.dto.*;
import com.renttrack.backend.auth.service.AuthService;
import com.renttrack.backend.user.entity.User;
import com.renttrack.backend.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;   // ✅ REQUIRED
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest req
    ) {
        authService.register(req);
        return ResponseEntity.ok(
                Map.of("message", "Registration successful")
        );
    }

    @PostMapping("/login")
    public AuthResponse login(
            @RequestBody LoginRequest req
    ) {
        return authService.login(req);
    }

    // ✅ FIXED
    @GetMapping("/me")
    public User me(Authentication authentication) {

        if (authentication == null) {
            throw new RuntimeException("Unauthorized");
        }

        return userRepository
                .findByEmail(authentication.getName())
                .orElseThrow();
    }

    @PostMapping("/forgot-password")
    public void forgotPassword(
            @RequestBody ForgotPasswordRequest req
    ) {
        authService.forgotPassword(req.getEmail());
    }
}
