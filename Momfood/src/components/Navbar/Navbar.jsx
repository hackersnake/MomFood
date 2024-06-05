// Navbar.jsx
import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({setShowLogin}) => {
    const [menu, setMenu] = useState("Home");

    const{getTotalCartAmount}=useContext(StoreContext);


    return (
        <div className='navbar'>
           <Link to='/'><img id='lg' src={assets.logo} alt="Logo" /></Link> 
            <ul className="navbar-menu">
                <Link to='/' onClick={() => setMenu("Home")} className={menu === "Home" ? "active" : ""}>Home</Link>
                <a href='#explore-menu' onClick={() => setMenu("Menu")} className={menu === "Menu" ? "active" : ""}>Menu</a>
                <a href='#download' onClick={() => setMenu("App")} className={menu === "App" ? "active" : ""}>App</a>
                <a href='#footer' onClick={() => setMenu("Contact-Us")} className={menu === "Contact-Us" ? "active" : ""}>Contact-Us</a>
            </ul>
            <div className="navbar-right">
                <img src={assets.search_icon} alt="Search Icon" />
                <div className="navbar-search-icon">
                    <Link to='/cart'> <img src={assets.basket_icon} alt="Basket Icon" /> </Link>
                     <div className={getTotalCartAmount()===0?"":"dot"}></div>
                </div>
                <button onClick={()=>setShowLogin(true)}>Sign In</button>
            </div>
        </div>
    );
};

export default Navbar;
