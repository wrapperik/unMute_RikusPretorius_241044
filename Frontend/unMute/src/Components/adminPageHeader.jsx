import React from 'react'
import { Shield } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import BreadCrumbs from './breadCrumbs'

export default function AdminPageHeader() {
  const location = useLocation()
  return (
    <div className="w-full mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
      <BreadCrumbs />
      <div className="flex items-center">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-blue-600" strokeWidth={2} />
          <h1 className="text-black font-medium text-4xl text-left">Admin Dashboard</h1>
        </div>
      </div>
      <div className="h-0.5 rounded-full bg-black mt-5 mb-8"></div>
    </div>
  )
}
