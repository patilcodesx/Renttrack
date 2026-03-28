package com.renttrack.backend.user.controller;

import com.renttrack.backend.common.response.ApiResponse;
import com.renttrack.backend.user.entity.User;
import com.renttrack.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile(
            Authentication authentication) {

        User user = userService.findByEmail(authentication.getName());
        user.setPassword(null); // never expose password
        return ResponseEntity.ok(ApiResponse.success(user));
    }
    @GetMapping
public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
    List<User> users = userService.getAllUsers();
    users.forEach(u -> u.setPassword(null)); // never expose passwords
    return ResponseEntity.ok(ApiResponse.success(users));
}
}