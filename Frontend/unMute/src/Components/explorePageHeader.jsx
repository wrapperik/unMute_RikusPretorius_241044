import React from 'react'
import { Plus } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import BreadCrumbs from './breadcrums'

export default function ExplorePageHeader() {
  const location = useLocation()
  return (
    <div className="w-full mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <BreadCrumbs />
      <div className="flex ">
      <h1 className="text-black  font-medium text-4xl text-left">Explore</h1>
      <Link to="/addpost" state={{ from: location.pathname }} className='btn rounded-full ml-auto text-black bg-white border-0 flex items-center gap-2'>
        <Plus size={16} />
        <span>Create Post</span>
      </Link>
      </div>
      <div className="h-0.5 rounded bg-black/50 mt-5 mb-10"></div>
    </div>
  )
}