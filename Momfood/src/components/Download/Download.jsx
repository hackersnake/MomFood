import React from 'react'
import './Download.css'
import { assets } from '../../assets/assets'

const Download = () => {
  return (
    <div className='download' id='download'>
        <p> Download our application <br /> MomFood </p>
        <div className="download-platforms">
        <img src={assets.app_store} alt="" />
            <img src={assets.play_store} alt="" />
        </div>


    </div>
  )
}

export default Download