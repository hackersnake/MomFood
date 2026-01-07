package com.example.momfood.controller;

import com.example.momfood.service.PaymentService;

import com.example.momfood.model.FoodItem;
import com.example.momfood.model.Order;
import com.example.momfood.model.OrderItem;
import com.example.momfood.model.User;
import com.example.momfood.repository.FoodItemRepository;
import com.example.momfood.repository.OrderItemRepository;
import com.example.momfood.repository.OrderRepository;
import com.example.momfood.service.AuthService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {
    private final AuthService authService;
    private final PaymentService paymentService;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final FoodItemRepository foodItemRepository;

    public OrderController(AuthService authService, OrderRepository orderRepository, OrderItemRepository orderItemRepository, FoodItemRepository foodItemRepository, PaymentService paymentService) {
        this.authService = authService;
        this.paymentService = paymentService;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.foodItemRepository = foodItemRepository;
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestHeader(name = "X-Auth-Token", required = false) String token,
                                        @RequestBody Map<String, Object> body) {
        if (token == null) return ResponseEntity.status(401).body(Map.of("error", "authentication required"));
        User user = authService.userForToken(token).orElse(null);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "invalid token"));

        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
        if (items == null || items.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "items required"));

        Order order = new Order();
        order.setUser(user);
        order.setDeliveryAddress((String) body.getOrDefault("deliveryAddress", ""));
        List<OrderItem> savedItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Map<String, Object> it : items) {
            Number fidN = (Number) it.get("foodItemId");
            Number qtyN = (Number) it.getOrDefault("quantity", 1);
            if (fidN == null) continue;
            Long fid = fidN.longValue();
            int qty = qtyN.intValue();
            FoodItem fi = foodItemRepository.findById(fid).orElse(null);
            if (fi == null) continue;
            BigDecimal line = fi.getPrice().multiply(BigDecimal.valueOf(qty));
            total = total.add(line);
            OrderItem oi = new OrderItem();
            oi.setFoodItem(fi);
            oi.setQuantity(qty);
            oi.setPrice(fi.getPrice());
            oi.setOrder(order);
            savedItems.add(oi);
        }

        order.setTotalAmount(total);
        order = orderRepository.save(order);
        for (OrderItem oi : savedItems) {
            oi.setOrder(order);
            orderItemRepository.save(oi);
        }

        return ResponseEntity.ok(Map.of("orderId", order.getId(), "total", order.getTotalAmount()));
    }

    @GetMapping("/{id}/receipt")
    public ResponseEntity<?> receipt(@RequestHeader(name = "X-Auth-Token", required = false) String token,
                                     @PathVariable Long id) {
        if (token == null) return ResponseEntity.status(401).body(Map.of("error", "authentication required"));
        User user = authService.userForToken(token).orElse(null);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "invalid token"));

        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        if (!order.getUser().getId().equals(user.getId())) return ResponseEntity.status(403).body(Map.of("error", "not allowed"));

        StringBuilder sb = new StringBuilder();
        sb.append("Receipt for Order #").append(order.getId()).append("\n");
        sb.append("Name: ").append(user.getName()).append("\n");
        sb.append("Total: ").append(order.getTotalAmount()).append("\n\n");
        sb.append("Items:\n");
        for (OrderItem oi : order.getOrderItems()) {
            sb.append("- ").append(oi.getFoodItem().getName()).append(" x").append(oi.getQuantity()).append(" @ ").append(oi.getPrice()).append("\n");
        }

        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);
        String filename = "receipt-" + order.getId() + ".txt";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(bytes);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<?> payOrder(@RequestHeader(name = "X-Auth-Token", required = false) String token,
                                        @PathVariable Long id,
                                        @RequestBody Map<String, Object> body) {
        if (token == null) return ResponseEntity.status(401).body(Map.of("error", "authentication required"));
        User user = authService.userForToken(token).orElse(null);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "invalid token"));
        String methodStr = (String) body.getOrDefault("method", "COD");
        Order.PaymentMethod method;
        try {
            method = Order.PaymentMethod.valueOf(methodStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "invalid payment method"));
        }
        try {
            Order updated = paymentService.processPayment(id, method);
            return ResponseEntity.ok(Map.of("orderId", updated.getId(), "paymentStatus", updated.getPaymentStatus().name()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@RequestHeader(name = "X-Auth-Token", required = false) String token,
                                      @PathVariable Long id) {
        if (token == null) return ResponseEntity.status(401).body(Map.of("error", "authentication required"));
        User user = authService.userForToken(token).orElse(null);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "invalid token"));

        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(403).body(Map.of("error", "not allowed"));
        }
        return ResponseEntity.ok(Map.of(
            "id", order.getId(),
            "status", order.getStatus(),
            "paymentStatus", order.getPaymentStatus(),
            "totalAmount", order.getTotalAmount()
        ));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders(@RequestHeader(name = "X-Auth-Token", required = false) String token) {
        if (token == null) return ResponseEntity.status(401).body(Map.of("error", "authentication required"));
        User user = authService.userForToken(token).orElse(null);
        if (user == null) return ResponseEntity.status(401).body(Map.of("error", "invalid token"));
        if (user.getRole() != User.Role.ADMIN) return ResponseEntity.status(403).body(Map.of("error", "not allowed"));

        List<Order> orders = orderRepository.findAll();
        List<Map<String, Object>> res = new ArrayList<>();
        for (Order o : orders) {
            res.add(Map.of(
                "id", o.getId(),
                "user", o.getUser().getName(),
                "total", o.getTotalAmount(),
                "status", o.getStatus(),
                "paymentStatus", o.getPaymentStatus(),
                "createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : ""
            ));
        }
        return ResponseEntity.ok(res);
    }
}

