package com.example.momfood.service;

import com.example.momfood.model.FoodItem;
import com.example.momfood.repository.FoodItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodItemService {
    private final FoodItemRepository foodItemRepository;

    public FoodItemService(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    public List<FoodItem> getAll() {
        return foodItemRepository.findAll();
    }

    public FoodItem getById(Long id) {
        return foodItemRepository.findById(id).orElse(null);
    }

    public FoodItem create(FoodItem item) {
        return foodItemRepository.save(item);
    }

    public FoodItem update(Long id, FoodItem update) {
        return foodItemRepository.findById(id).map(existing -> {
            existing.setName(update.getName());
            existing.setDescription(update.getDescription());
            existing.setPrice(update.getPrice());
            existing.setImageUrl(update.getImageUrl());
            existing.setIsAvailable(update.getIsAvailable());
            existing.setCategory(update.getCategory());
            return foodItemRepository.save(existing);
        }).orElse(null);
    }

    public boolean delete(Long id) {
        return foodItemRepository.findById(id).map(existing -> {
            foodItemRepository.delete(existing);
            return true;
        }).orElse(false);
    }
}
