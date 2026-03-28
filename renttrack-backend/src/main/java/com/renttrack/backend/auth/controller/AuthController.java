package com.renttrack.backend.auth.controller;

import com.renttrack.backend.auth.dto.*;
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

    /**
     * ✅ FIXED: returns UserDto (no password hash exposed)
     */
    @GetMapping("/me")
    public ResponseEntity<UserDto> me(Authentication authentication) {

        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }

        User user = userRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDto dto = UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/contact")
public ResponseEntity<?> contactAdmin(@RequestBody Map<String, String> body) {
    String email = body.get("email");
    String message = body.get("message");
    authService.sendContactEmail(email, message);
    return ResponseEntity.ok(Map.of("message", "Request sent"));
}

  
@PostMapping("/forgot-password")
public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
    authService.forgotPassword(req.getEmail());
    return ResponseEntity.ok(Map.of("message", "Reset email sent"));
}

   @PostMapping("/reset-password")
public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
    authService.resetPassword(req.getToken(), req.getNewPassword());
    return ResponseEntity.ok(Map.of("message", "Password reset successful"));
}
@PostMapping("/set-password")
public ResponseEntity<?> setPassword(@RequestBody Map<String, String> body) {
    var result = authService.setPasswordFromInvite(
        body.get("token"), body.get("password"));
    return ResponseEntity.ok(result);
}

@GetMapping("/validate-invite")
public ResponseEntity<?> validateInvite(@RequestParam String token) {
    String email = authService.validateInviteToken(token);
    return ResponseEntity.ok(Map.of("email", email, "valid", true));
}
}