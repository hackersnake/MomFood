package com.example.momfood.controller;

import com.example.momfood.model.User;
import com.example.momfood.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String email = body.get("email");
        String password = body.get("password");
        if (name == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "name,email,password required"));
        }
        String roleStr = body.getOrDefault("role", "CUSTOMER");
        User.Role role = User.Role.valueOf(roleStr);
        try {
                User u = authService.signup(name, email, password, role);
                String token = authService.createSession(u.getId());
                return ResponseEntity.ok(Map.of(
                    "token", token,
                    "user", Map.of(
                        "id", u.getId(),
                        "name", u.getName(),
                        "email", u.getEmail(),
                        "role", u.getRole().name()
                    )
                ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "email,password required"));
        }
        return authService.login(email, password)
                .map(u -> {
                        String token = authService.createSession(u.getId());
                        return ResponseEntity.ok(Map.of(
                            "token", token,
                            "user", Map.of(
                                "id", u.getId(),
                                "name", u.getName(),
                                "email", u.getEmail(),
                                "role", u.getRole().name()
                            )
                        ));
                })
                .orElse(ResponseEntity.status(401).body(Map.of("error", "invalid credentials")));
    }
}
