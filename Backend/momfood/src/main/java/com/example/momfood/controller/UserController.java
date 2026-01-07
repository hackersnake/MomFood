package com.example.momfood.controller;

import com.example.momfood.model.User;
import com.example.momfood.repository.UserRepository;
import com.example.momfood.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
public class UserController {
    private final AuthService authService;
    private final UserRepository userRepository;

    public UserController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader(name = "X-Auth-Token", required = false) String token) {
        Optional<User> opt = authService.userForToken(token);
        if (opt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        }
        User user = opt.get();
        // Return basic profile info
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        ));
    }

    @PostMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader(name = "X-Auth-Token", required = false) String token,
                                           @RequestBody Map<String, Object> body) {
        Optional<User> opt = authService.userForToken(token);
        if (opt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        }
        User user = opt.get();
        String name = (String) body.get("name");
        if (name != null) {
            user.setName(name);
        }
        // Could add more fields later
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "profile updated"));
    }
}
