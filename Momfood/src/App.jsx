// App.jsx
import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import Admin from './pages/Admin/Admin';
import { Route, Routes } from 'react-router-dom';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import OrderSuccess from './pages/OrderSuccess/OrderSuccess';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import Footer from './components/Footer/Footer';
import LoginPopup from './components/LoginPopup/LoginPopup';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className='app'>
        <Navbar setShowLogin={setShowLogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/order-success' element={<OrderSuccess />} />
          <Route path='/admin' element={<Admin />} />
        </Routes>
      </div>
      <Footer />
    </>
  );
};

export default App;
