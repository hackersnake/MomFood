import React, { useContext } from 'react'
import './ExploreMenu.css'
import { StoreContext } from '../../context/StoreContext'

const ExploreMenu = ({ category, setCategory }) => {

    const { categoryList } = useContext(StoreContext)

    return (
        <div className='explore-menu' id='explore-menu'>
            <h1>Explore Our Menu</h1>
            <p className='explore-menu-text'>Discover a wide variety of cuisines and dishes crafted to satisfy every craving. Whether you're in the mood for a quick snack or a full hearty meal, we have something special for everyone.</p>
            <div className="explore-menu-list">
                {categoryList.map((item, index) => {
                    return (
                        <div onClick={() => setCategory(prev => prev === item.name ? "All" : item.name)} key={index} className="explore-menu-list-item">
                            <img className={category === item.name ? "active" : ""} src={item.imageUrl} alt="" />
                            <p>{item.name}</p>
                        </div>
                    )
                })}
            </div>
            <hr />
        </div>
    )
}

export default ExploreMenu