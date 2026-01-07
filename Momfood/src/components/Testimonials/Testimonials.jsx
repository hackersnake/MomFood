import React from 'react'
import './Testimonials.css'
import { assets } from '../../assets/assets'

const Testimonials = () => {
    const reviews = [
        {
            name: "Alex Johnson",
            role: "Food Enthusiast",
            text: "The best home-style food I've ever ordered online. The quality is consistent and the delivery is always on time!",
            rating: 5
        },
        {
            name: "Maria Garcia",
            role: "Daily Customer",
            text: "MomFood has saved my busy workdays. Wholesome meals that actually taste like they were made with love.",
            rating: 5
        },
        {
            name: "James Wilson",
            role: "Verified Buyer",
            text: "Amazing variety and very fresh ingredients. The new search feature makes it so easy to find my favorite pasta!",
            rating: 4
        }
    ]

    return (
        <div className='testimonials' id='testimonials'>
            <h2>What Our Customers Say</h2>
            <div className="testimonials-grid">
                {reviews.map((review, index) => (
                    <div key={index} className="testimonial-card">
                        <div className="stars">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                        </div>
                        <p className="review-text">"{review.text}"</p>
                        <div className="user-info">
                            <h4>{review.name}</h4>
                            <span>{review.role}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Testimonials
