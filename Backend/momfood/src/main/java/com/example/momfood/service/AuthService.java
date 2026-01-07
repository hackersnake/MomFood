package com.example.momfood.service;

import com.example.momfood.model.User;
import com.example.momfood.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // simple in-memory token store: token -> userId
    private final Map<String, Long> sessions = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User signup(String name, String email, String rawPassword, User.Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }
        String hashed = passwordEncoder.encode(rawPassword);
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(hashed);
        u.setRole(role != null ? role : User.Role.CUSTOMER);
        return userRepository.save(u);
    }

    public Optional<User> login(String email, String rawPassword) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) return Optional.empty();
        User u = userOpt.get();
        if (passwordEncoder.matches(rawPassword, u.getPassword())) {
            return Optional.of(u);
        }
        return Optional.empty();
    }

    public String createSession(Long userId) {
        String token = UUID.randomUUID().toString();
        sessions.put(token, userId);
        return token;
    }

    public Optional<User> userForToken(String token) {
        Long id = sessions.get(token);
        if (id == null) return Optional.empty();
        return userRepository.findById(id);
    }
}
