package com.example.momfood.controller;

import com.example.momfood.model.Category;
import com.example.momfood.model.FoodItem;
import com.example.momfood.model.User;
import com.example.momfood.repository.CategoryRepository;
import com.example.momfood.service.AuthService;
import com.example.momfood.service.FoodItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    private final AuthService authService;
    private final FoodItemService foodItemService;
    private final CategoryRepository categoryRepository;

    public AdminController(AuthService authService, FoodItemService foodItemService, CategoryRepository categoryRepository) {
        this.authService = authService;
        this.foodItemService = foodItemService;
        this.categoryRepository = categoryRepository;
    }

    @PostMapping("/food")
    public ResponseEntity<?> createFood(@RequestHeader(name = "X-Auth-Token", required = false) String token, @RequestBody Map<String, Object> body) {
        User u = authService.userForToken(token).orElse(null);
        if (u == null) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        if (u.getRole() != User.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "forbidden"));

        String name = (String) body.get("name");
        String description = (String) body.get("description");
        Number priceNum = (Number) body.get("price");
        String imageUrl = (String) body.getOrDefault("imageUrl", "");
        Number categoryIdNum = (Number) body.get("categoryId");
        boolean isAvailable = body.getOrDefault("isAvailable", Boolean.TRUE) == Boolean.TRUE;

        if (name == null || priceNum == null || categoryIdNum == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "name, price, categoryId required"));
        }

        Category cat = categoryRepository.findById(categoryIdNum.longValue()).orElse(null);
        if (cat == null) return ResponseEntity.badRequest().body(Map.of("error", "invalid categoryId"));

        FoodItem item = new FoodItem();
        item.setName(name);
        item.setDescription(description);
        item.setPrice(BigDecimal.valueOf(priceNum.doubleValue()));
        item.setImageUrl(imageUrl);
        item.setCategory(cat);
        item.setIsAvailable(isAvailable);

        FoodItem saved = foodItemService.create(item);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/category")
    public ResponseEntity<?> createCategory(@RequestHeader(name = "X-Auth-Token", required = false) String token,
                                            @RequestBody Map<String, Object> body) {
        User u = authService.userForToken(token).orElse(null);
        if (u == null) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        if (u.getRole() != User.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
        String name = (String) body.get("name");
        String imageUrl = (String) body.getOrDefault("imageUrl", "");
        if (name == null) return ResponseEntity.badRequest().body(Map.of("error", "name required"));
        Category cat = new Category();
        cat.setName(name);
        cat.setImageUrl(imageUrl);
        Category saved = categoryRepository.save(cat);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/category/{id}")
    public ResponseEntity<?> updateCategory(@RequestHeader(name = "X-Auth-Token", required = false) String token,
                                            @PathVariable Long id,
                                            @RequestBody Map<String, Object> body) {
        User u = authService.userForToken(token).orElse(null);
        if (u == null) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        if (u.getRole() != User.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
        Category cat = categoryRepository.findById(id).orElse(null);
        if (cat == null) return ResponseEntity.badRequest().body(Map.of("error", "category not found"));
        String name = (String) body.get("name");
        String imageUrl = (String) body.get("imageUrl");
        if (name != null) cat.setName(name);
        if (imageUrl != null) cat.setImageUrl(imageUrl);
        Category saved = categoryRepository.save(cat);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/category/{id}")
    public ResponseEntity<?> deleteCategory(@RequestHeader(name = "X-Auth-Token", required = false) String token,
                                            @PathVariable Long id) {
        User u = authService.userForToken(token).orElse(null);
        if (u == null) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        if (u.getRole() != User.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
        if (!categoryRepository.existsById(id)) return ResponseEntity.badRequest().body(Map.of("error", "category not found"));
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "category deleted"));
    }

    @GetMapping("/categories")
    public ResponseEntity<?> listCategories(@RequestHeader(name = "X-Auth-Token", required = false) String token) {
        User u = authService.userForToken(token).orElse(null);
        if (u == null) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        // Allow any authenticated user to view categories
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    // End of added admin category endpoints

    @PutMapping("/food/{id}")
    public ResponseEntity<?> updateFood(@RequestHeader(name = "X-Auth-Token", required = false) String token,
                                        @PathVariable Long id,
                                        @RequestBody Map<String, Object> body) {
        User u = authService.userForToken(token).orElse(null);
        if (u == null) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        if (u.getRole() != User.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "forbidden"));

        FoodItem existing = foodItemService.getById(id);
        if(existing == null) return ResponseEntity.notFound().build();

        String name = (String) body.get("name");
        String description = (String) body.get("description");
        Number priceNum = (Number) body.get("price");
        String imageUrl = (String) body.get("imageUrl");
        Number categoryIdNum = (Number) body.get("categoryId");
        Boolean isAvailable = (Boolean) body.get("isAvailable");

        if(name != null) existing.setName(name);
        if(description != null) existing.setDescription(description);
        if(priceNum != null) existing.setPrice(BigDecimal.valueOf(priceNum.doubleValue()));
        if(imageUrl != null) existing.setImageUrl(imageUrl);
        if(categoryIdNum != null) {
            Category cat = categoryRepository.findById(categoryIdNum.longValue()).orElse(null);
            if(cat != null) existing.setCategory(cat);
        }
        if(isAvailable != null) existing.setIsAvailable(isAvailable);

        FoodItem saved = foodItemService.update(id, existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/food/{id}")
    public ResponseEntity<?> deleteFood(@RequestHeader(name = "X-Auth-Token", required = false) String token,
                                        @PathVariable Long id) {
        User u = authService.userForToken(token).orElse(null);
        if (u == null) return ResponseEntity.status(401).body(Map.of("error", "unauthorized"));
        if (u.getRole() != User.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "forbidden"));
        boolean removed = foodItemService.delete(id);
        return removed ? ResponseEntity.ok(Map.of("message", "deleted")) : ResponseEntity.notFound().build();
    }
}
