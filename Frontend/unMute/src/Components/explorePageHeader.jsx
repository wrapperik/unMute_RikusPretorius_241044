import React from 'react'
import { Plus, Search, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import BreadCrumbs from './breadCrumbs'

export default function ExplorePageHeader({ searchQuery = '', setSearchQuery }) {
  const location = useLocation()
  
  return (
    <div className="w-full mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
      <BreadCrumbs />
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <h1 className="text-black font-bold text-4xl text-left">Explore</h1>
        
        {/* Search Bar */}
        {setSearchQuery && (
          <div className="flex-1 max-w-md relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts..."
              className="w-full pl-10 pr-10 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-[#004643] transition-colors text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        
        <Link 
          to="/addpost" 
          state={{ from: location.pathname }} 
          className='btn rounded-full ml-auto bg-[#004643] text-white border-2 border-[#004643] hover:bg-white hover:text-[#004643] transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg px-5 py-2.5 font-semibold text-sm'
        >
          <Plus size={20} strokeWidth={2.5} />
          <span className="hidden sm:inline">Create Post</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>
      <div className="h-0.5 rounded-full bg-gradient-to-r from-[#004643] to-transparent mt-6 mb-8"></div>
    </div>
  )
}