import React from 'react'
import Navbar from '../Components/navbar'
import Features from '../Components/features'
import HomeAbout from '../Components/homeAbout'

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      {/* Header image section */}
      <div
        className="w-full h-[50vh] bg-cover bg-center bg-no-repeat flex items-center justify-end"
        style={{ backgroundImage: "url('/header3.png')" }}
      >
        <div className="max-w-xl px-6 md:px-12 text-right">
          <h2 className="text-5xl md:text-5xl text-black font-bold leading-tight pr-20">
            Because silence isn't strength.
          </h2>
        </div>
      </div>
      <Features />
      <HomeAbout />
    </div>
  )
}