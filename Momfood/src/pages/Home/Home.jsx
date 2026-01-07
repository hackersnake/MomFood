import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import Download from '../../components/Download/Download'
import OfferBanner from '../../components/OfferBanner/OfferBanner'
import Testimonials from '../../components/Testimonials/Testimonials'

const Home = () => {
  const [category, setCategory] = useState("All");
  return (
    <div>
      <Header />
      <OfferBanner />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} />
      <Testimonials />
      <Download />
    </div>
  )
}

export default Home