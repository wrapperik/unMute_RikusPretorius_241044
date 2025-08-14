import React from 'react'
import Navbar from '../Components/navbar'
import Features from '../Components/features'

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      {/* Header image section */}
      <div
        className="w-full h-[100vh] bg-cover bg-centre flex p-55 items-start justify-center"
        style={{ backgroundImage: "url('/public/textured-graphic.png')" }}
      >
        <h2 className="text-5xl text-graphite p-4 rounded font-semibold ">Because silence isn't strength.</h2>
      </div>

      <Features />
    </div>
  )
}