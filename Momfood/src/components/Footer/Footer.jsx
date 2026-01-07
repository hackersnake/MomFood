import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'
const Footer = () => {
    return (
        <div className='footer' id='footer'>
            <div className="footer-content">
                <div className="footer-content-left">
                    < img className='ilogo' src={assets.logo} alt="" />
                    <p>MomFood is dedicated to bringing you the comfort of home-cooked meals every day. Our mission is to bridge the gap between busy lifestyles and healthy eating through authentic recipes and passion for good food.</p>
                    <div className="footer-social-icons">
                        <img src={assets.facebook_icon} alt="" />
                        <img src={assets.twitter_icon} alt="" />
                        <img src={assets.linkedin_icon} alt="" />
                    </div>
                </div>
                <div className="footer-content-center">
                    <h2>Company</h2>
                    <ul>
                        <li>Home</li>
                        <li>About Us</li>
                        <li>Delivery</li>
                        <li>Privacy Policy</li>
                    </ul>
                </div>
                <div className="footer-content-right">
                    <h2>GET IN TOUCH</h2>
                    <ul>
                        <li>9850174568</li>
                        <li>shongaikwad10169@gmail.com</li>
                    </ul>
                </div>
                <div className="footer-content-newsletter">
                    <h2>Newsletter</h2>
                    <p>Subscribe to get latest updates and offers.</p>
                    <div className="newsletter-box">
                        <input type="email" placeholder="Enter your email" />
                        <button>Subscribe</button>
                    </div>
                </div>
            </div>
            <hr />
            <p className="footer-copyright">
                Copyright 2024  @Momfood.com-All Right Reserved Owner Shon Gaikwad
            </p>

        </div>
    )
}

export default Footer