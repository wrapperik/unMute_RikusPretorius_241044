import React, { useContext } from 'react'
import { Plus } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import BreadCrumbs from './breadCrumbs.jsx'
import { AuthContext } from '../context/AuthContext.jsx'

export default function ResourcesPageHeader() {
  const location = useLocation()
  const { user } = useContext(AuthContext)
  const isAdmin = !!(user && (user.is_admin || user.isAdmin))
  return (
    <div className="w-full mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
      <BreadCrumbs />
      <div className="flex ">
        <h1 className="text-black  font-medium text-4xl text-left">Resources</h1>
        {isAdmin && (
          <Link
            to="/addresource"
            state={{ from: location.pathname }}
            className='btn rounded-full ml-auto bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg px-5 py-2 font-medium text-sm'
          >
            <Plus size={16} />
            <span>Add Resource</span>
          </Link>
        )}
      </div>
      <div className="h-0.5 rounded bg-black/50 mt-5 mb-10"></div>
    </div>
  )
}
