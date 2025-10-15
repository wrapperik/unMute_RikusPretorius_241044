import React from 'react'
import { Plus } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import BreadCrumbs from './breadCrumbs'

export default function ExplorePageHeader() {
  const location = useLocation()
  return (
    <div className="w-full mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <BreadCrumbs />
      <div className="flex items-center">
        <h1 className="text-black font-medium text-4xl text-left">Explore</h1>
        <Link 
          to="/addpost" 
          state={{ from: location.pathname }} 
          className='btn rounded-full ml-auto bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg px-5 py-2 font-medium text-sm'
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Create Post</span>
        </Link>
      </div>
      <div className="h-0.5 rounded-full bg-black mt-5 mb-8"></div>
    </div>
  )
}