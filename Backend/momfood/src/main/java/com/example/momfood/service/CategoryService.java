package com.example.momfood.service;

import com.example.momfood.model.Category;
import com.example.momfood.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

    public Category getById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    public Category create(Category category) {
        return categoryRepository.save(category);
    }

    public Category update(Long id, Category update) {
        return categoryRepository.findById(id).map(existing -> {
            existing.setName(update.getName());
            existing.setImageUrl(update.getImageUrl());
            return categoryRepository.save(existing);
        }).orElse(null);
    }

    public boolean delete(Long id) {
        return categoryRepository.findById(id).map(existing -> {
            categoryRepository.delete(existing);
            return true;
        }).orElse(false);
    }
}
