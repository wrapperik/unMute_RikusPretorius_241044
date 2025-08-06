import React from 'react'
import Navbar from '../Components/navbar'

export default function Home() {
  return (
    <div
      className="min-h-screen w-full flex flex-col bg-cover bg-center"
      style={{
        backgroundImage: "url('/public/background.png')", // Change to your image path
        minHeight: '100vh',
        minWidth: '100vw',
      }}
    >
      <Navbar />
      <main className="flex-1 w-full flex flex-col items-center py-12 px-4">
        <h2 className="text-3xl text-black bg-white p-2 font-semibold mb-4">Because silence isn't strength.</h2>
      </main>
    </div>
  )
}