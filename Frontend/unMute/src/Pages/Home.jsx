import React from 'react'

import Features from '../Components/features'
import HomeAbout from '../Components/homeAbout'
import CloudLayer from '../Components/CloudLayer'

export default function Home() {
  return (
  <div className="min-h-screen w-full flex flex-col">
    {/* Centered page container to keep consistent widths */}
    <div className="w-full max-w-8xl mx-auto px-6 md:px-8 flex flex-col">
      {/* Header image section */}
      <div
        className="h-[60vh] bg-[#f4f4f4] rounded-3xl shadow-lg flex my-10 justify-center relative overflow-hidden"
      >
        
        {/* Cloud layer behind the transparent hero image */}
        <CloudLayer />
        
        {/* Mountain and birds - transparent PNG on top (Cloudinary) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-20"
          style={{ backgroundImage: "url('https://res.cloudinary.com/dir5vkg3u/image/upload/v1761170791/hero-mountain_2_i3yso5.png')" }}
        />
        
        <div className="max-w-xl px-6 md:px-12 text-center relative z-30">
          <h2 className="text-5xl md:text-5xl mt-30 text-black font-medium leading-tight">
            Because silence isn't strength.
          </h2>
        </div>
      </div>

      {/* Features and About will sit inside the same centered container */}
      <div className="w-full">
        <Features />
      </div>

      <div className="w-full">
        <HomeAbout />
      </div>
    </div>
    </div>
  )
}