package com.renttrack.backend.user.service;

import com.renttrack.backend.user.entity.User;
import com.renttrack.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateProfile(UUID id, String name, String phone) {
        User user = findById(id);
        user.setName(name);
        user.setPhone(phone);
        return userRepository.save(user);
    }
    public List<User> getAllUsers() {
    return userRepository.findAll();
}
}