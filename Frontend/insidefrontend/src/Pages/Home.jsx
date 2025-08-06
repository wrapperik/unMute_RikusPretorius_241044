import React from 'react'
import Navbar from '../Components/navbar'

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Navbar />
      {/* Header image section */}
      <div
        className="w-full h-[600px] bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/public/banner.jpg')" }}
      >
        <h2 className="text-3xl text-black bg-white bg-opacity-80 p-4 rounded font-semibold shadow">Because silence isn't strength.</h2>
      </div>

      <div className='py-20'>
        <h1 className='text-black text-4xl font-semibold py-10 px-60'>What we offer...</h1>
      {/* Row of 4 cards */}
      <div className="w-full flex justify-center items-center mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-6xl px-4">
          {/* Card 1 */}
          <div className="flex flex-col items-center bg-white rounded-lg shadow p-4">
            <img src="/public/placeholder1.gif" alt="Card 1" className="w-80 h-80 object-cover rounded" />
            <h3 className="mt-4 text-lg text-black font-semibold">Feature 1</h3>
          </div>
          {/* Card 2 */}
          <div className="flex flex-col items-center bg-white rounded-lg shadow p-4">
            <img src="/public/placeholder2.jpg" alt="Card 2" className="w-80 h-80 object-cover rounded" />
            <h3 className="mt-4 text-lg text-black font-semibold">Feature 2</h3>
          </div>
          {/* Card 3 */}
          <div className="flex flex-col items-center bg-white rounded-lg shadow p-4">
            <img src="/public/placeholder3.jpg" alt="Card 3" className="w-80 h-80 object-cover rounded" />
            <h3 className="mt-4 text-lg text-black font-semibold">Feature 3</h3>
          </div>
          {/* Card 4 */}
          <div className="flex flex-col items-center bg-white rounded-lg shadow p-4">
            <img src="/public/placeholder4.jpg" alt="Card 4" className="w-80 h-80 object-cover rounded" />
            <h3 className="mt-4 text-lg text-black font-semibold">Feature 4</h3>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}