import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  return (
    <nav className="bg-none px-50 py-4 flex justify-between items-center">
      <h1 className="text-4xl font-regular text-black"><strong>un</strong>Mute</h1>
      <button
        onClick={() => navigate('/signup')}
        className="bg-black text-white px-4 py-2 rounded-full hover:bg-orange-700 transition"
      >
        Sign Up
      </button>
    </nav>
  )
}
