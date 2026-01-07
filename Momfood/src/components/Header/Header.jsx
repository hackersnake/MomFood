import React, { useContext, useState } from 'react'
import './Header.css'
import { StoreContext } from '../../context/StoreContext'

const Header = () => {
  const { user, token } = useContext(StoreContext);
  const [adding, setAdding] = useState(false);

  return (
    <div className='header'>
      <div className="header-contents">
        <h2>order your food</h2>
        <p>Experience the warmth of home-style cooking, delivered right to your doorstep. Choose from a curated selection of wholesome meals prepared with love and the freshest ingredients.</p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button>View Menu</button>
        </div>
      </div>
    </div>
  )
}

export default Header