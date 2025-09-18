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
        className="w-full h-[100vh] bg-cover bg-center bg-no-repeat flex pt-30 md:pt-55 items-start justify-center"
        style={{ backgroundImage: "url('/header.png')" }}
      >
        <h2 className="text-4xl md:text-5xl text-dark-clay font-semibold text-center">Because silence isn't strength.</h2>
      </div>
      <Features />
      <HomeAbout />
    </div>
  )
}