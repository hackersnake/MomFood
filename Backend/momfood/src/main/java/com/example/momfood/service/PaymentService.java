package com.example.momfood.service;

import com.example.momfood.model.Order;
import com.example.momfood.model.Order.PaymentMethod;
import com.example.momfood.model.Order.PaymentStatus;
import com.example.momfood.repository.OrderRepository;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {
    private final OrderRepository orderRepository;

    public PaymentService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Simulate payment processing. In a real system this would integrate with a payment gateway.
     * For now we simply set the payment method and mark the status as PAID.
     */
    public Order processPayment(Long orderId, PaymentMethod method) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new IllegalArgumentException("Order not found"));
        order.setPaymentMethod(method);
        order.setPaymentStatus(PaymentStatus.PAID);
        return orderRepository.save(order);
    }
}
