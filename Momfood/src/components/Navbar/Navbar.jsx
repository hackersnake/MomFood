// Navbar.jsx
import React, { useContext, useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({ setShowLogin }) => {
    const [menu, setMenu] = useState("Home");

    const { getTotalCartAmount, search, setSearch, user, logout } = useContext(StoreContext);
    const [showSearch, setShowSearch] = useState(false);

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className='navbar'>
            <Link to='/'><img id='lg' src={assets.logo} alt="Logo" /></Link>
            <ul className="navbar-menu">
                <Link to='/' onClick={() => setMenu("Home")} className={menu === "Home" ? "active" : ""}>Home</Link>
                <li onClick={() => { setMenu("Menu"); scrollToSection("explore-menu"); }} className={menu === "Menu" ? "active" : ""}>Menu</li>
                <li onClick={() => { setMenu("App"); scrollToSection("download"); }} className={menu === "App" ? "active" : ""}>App</li>
                <li onClick={() => { setMenu("Contact-Us"); scrollToSection("footer"); }} className={menu === "Contact-Us" ? "active" : ""}>Contact-Us</li>
            </ul>
                <div className="navbar-right">
                <div className={`navbar-search-container ${showSearch ? 'active' : ''}`}>
                    <img src={assets.search_icon} alt="Search Icon" onClick={() => setShowSearch(!showSearch)} />
                    {showSearch && (
                        <input
                            type="text"
                            placeholder="Search dishes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onBlur={() => search === "" && setShowSearch(false)}
                            autoFocus
                        />
                    )}
                </div>
                <div className="navbar-search-icon">
                    <Link to='/cart'> <img src={assets.basket_icon} alt="Basket Icon" /> </Link>
                    <div className={getTotalCartAmount() === 0 ? "" : "dot"}></div>
                </div>
                {user ? (
                    <>
                        <span style={{marginRight:8}}>Hi, {user.name}</span>
                        {user.role === 'ADMIN' && <Link to='/admin' style={{marginRight:8}}>Admin</Link>}
                        <button onClick={logout}>Logout</button>
                    </>
                ) : (
                    <button onClick={() => setShowLogin(true)}>Sign In</button>
                )}
            </div>
        </div>
    );
};

export default Navbar;
