import React from 'react'
import { Plus, Search, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import BreadCrumbs from './breadCrumbs'

export default function ExplorePageHeader({ searchQuery, setSearchQuery }) {
  const location = useLocation()
  
  return (
    <div className="w-full mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
      <BreadCrumbs />
      
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0">
        <h1 className="text-black font-bold text-4xl text-left">Explore</h1>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-0 sm:mx-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search posts, topics, or users..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#004643] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery && setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        
        {/* Create Post Button */}
        <Link 
          to="/addpost" 
          state={{ from: location.pathname }} 
          className='btn rounded-full bg-[#004643] text-white border-2 border-[#004643] hover:bg-white hover:text-[#004643] transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg px-5 py-2.5 font-semibold text-sm whitespace-nowrap'
        >
          <Plus size={20} strokeWidth={2.5} />
          <span className="hidden sm:inline">Create Post</span>
          <span className="sm:hidden">Post</span>
        </Link>
      </div>
      
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mt-6 mb-6"></div>
    </div>
  )
}