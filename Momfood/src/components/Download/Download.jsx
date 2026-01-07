import React from 'react'
import './Download.css'
import { assets } from '../../assets/assets'

const Download = () => {
  return (
    <div className='download' id='download'>
      <h2>Ready to order?</h2>
      <p>Get the MomFood app for a faster and more seamless experience. Available now on your favorite platform.</p>
      <div className="download-platforms">
        <img src={assets.app_store} alt="App Store" />
        <img src={assets.play_store} alt="Play Store" />
      </div>
    </div>
  )
}

export default Download