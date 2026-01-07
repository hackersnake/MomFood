import React from 'react'
import './OfferBanner.css'

const OfferBanner = () => {
    return (
        <div className='offer-banner'>
            <div className="offer-content">
                <span className="badge">Special Offer</span>
                <h3>Get 50% OFF on your first order!</h3>
                <p>Use code: <strong>MOM50</strong> at checkout</p>
                <button className="offer-btn">Order Now</button>
            </div>
        </div>
    )
}

export default OfferBanner
