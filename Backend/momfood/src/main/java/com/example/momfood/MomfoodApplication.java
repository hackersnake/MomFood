package com.example.momfood;

import com.example.momfood.model.Category;
import com.example.momfood.model.FoodItem;
import com.example.momfood.repository.CategoryRepository;
import com.example.momfood.repository.FoodItemRepository;
import com.example.momfood.repository.UserRepository;
import com.example.momfood.model.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.math.BigDecimal;

@SpringBootApplication
public class MomfoodApplication {

	public static void main(String[] args) {
		SpringApplication.run(MomfoodApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedData(CategoryRepository categoryRepository, FoodItemRepository foodItemRepository, UserRepository userRepository) {
		return args -> {
			if (categoryRepository.count() == 0) {
				Category rice = categoryRepository.save(new Category(null, "Rice", ""));
				Category curry = categoryRepository.save(new Category(null, "Curry", ""));

				foodItemRepository.save(new FoodItem(null, "Plain Rice", "Steamed plain rice", new BigDecimal("1.50"), "", rice, true));
				foodItemRepository.save(new FoodItem(null, "Chicken Curry", "Spicy chicken curry", new BigDecimal("5.50"), "", curry, true));
			}

			// create a default admin account if not present (seeded password: Test@123)
			if (!userRepository.existsByEmail("admin@local")) {
				BCryptPasswordEncoder enc = new BCryptPasswordEncoder();
				User admin = new User();
				admin.setName("Admin");
				admin.setEmail("admin@local");
				admin.setPassword(enc.encode("Test@123"));
				admin.setRole(User.Role.ADMIN);
				userRepository.save(admin);
			}
		};
	}

}
