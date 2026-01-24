package com.renttrack.backend.auth.controller;

import com.renttrack.backend.auth.dto.AuthResponse;
import com.renttrack.backend.auth.dto.ForgotPasswordRequest;
import com.renttrack.backend.auth.dto.LoginRequest;
import com.renttrack.backend.auth.dto.RegisterRequest;
import com.renttrack.backend.auth.service.AuthService;
import com.renttrack.backend.user.entity.User;
import com.renttrack.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthService authService;
    private  final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            authService.register(req);
            return ResponseEntity.ok(
                    Map.of("message", "Registration successful")
            );
        } catch (RuntimeException e) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public User me(Authentication auth) {
        return userRepository.findByEmail(auth.getName()).orElseThrow();
    }



    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req){
        return authService.login(req);

    }

    @PostMapping("/forgot-password")
    public void forgotPassword(@RequestBody ForgotPasswordRequest req){
        authService.forgotPassword(req.getEmail());
    }
}
