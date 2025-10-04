import React from 'react'

import Features from '../Components/features'
import HomeAbout from '../Components/homeAbout'

export default function Home() {
  return (
  <div className="min-h-screen w-full flex flex-col">
      {/* Header image section */}
      <div
        className="w-full h-[60vh] bg-cover bg-center bg-no-repeat flex justify-center"
        style={{ backgroundImage: "url('/hero-mountain.png')" }}
      >
        <div className="max-w-xl px-6 md:px-12 text-center">
          <h2 className="text-5xl md:text-5xl mt-30 text-black font-medium leading-tight">
            Because silence isn't strength.
          </h2>
        </div>
      </div>
      <Features />
      <HomeAbout />
    </div>
  )
}