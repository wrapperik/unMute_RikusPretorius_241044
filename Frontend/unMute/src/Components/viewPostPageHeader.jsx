import React from 'react'
import { Send } from 'lucide-react'
import BreadCrumbs from './breadCrumbs'

export default function ViewPostPageHeader() {
  return (
    <div className="w-full mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
       <BreadCrumbs />
    </div>
  )
}