import React from 'react';
import {
  Compass,
  Info
} from "lucide-react";

export default function HomeAbout() {
  return (
    <><div>
      <h1 className="text-black mb-10 font-medium text-3xl text-center">What we're about</h1>
    </div><div className="flex flex-col md:flex-row justify-center items-center m-auto mb-20 mx-10 max-w-8xl gap-15 bg-white/60 p-20 rounded-3xl shadow-sm">
        {/* Text Section */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl text-black font-bold mb-4">Giving men a voice</h1>
          <p className="text-gray-700 mb-6">
            Welcome to unMute, where we empower voices and foster meaningful connections. Join our community to explore, learn, and grow together.
          </p>
          <div className="flex justify-center md:justify-start gap-4">
            <button className="px-6 py-2 bg-[#659583] text-white rounded hover:bg-[#244538] flex items-center gap-2">
              <Info className="w-4 h-4" />
              Learn More
            </button>
            <button className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center gap-2">
              <Compass className="w-4 h-4" />
              Explore
            </button>
          </div>
        </div>

        {/* Image Section */}
        <div className="flex-end">
          <img
            src="/public/about.png"
            alt="Community illustration"
            className="w-100 h-auto" />
        </div>
      </div></>
  );
}