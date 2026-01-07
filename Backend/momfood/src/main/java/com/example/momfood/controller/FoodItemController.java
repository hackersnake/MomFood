package com.example.momfood.controller;

import com.example.momfood.model.FoodItem;
import com.example.momfood.service.FoodItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/food")
@CrossOrigin(origins = "*")
public class FoodItemController {
    private final FoodItemService foodItemService;

    public FoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    @GetMapping
    public List<FoodItem> all() {
        return foodItemService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItem> getById(@PathVariable Long id) {
        FoodItem f = foodItemService.getById(id);
        return f == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(f);
    }
}
