import React from 'react'
import { Send } from 'lucide-react'
import BreadCrumbs from './breadcrums'

export default function AddPostPageHeader() {
  return (
    <div className="w-full mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
    
       <BreadCrumbs />
      
      <div className="flex ">
      <h1 className="text-black  font-medium text-4xl text-left">New Post</h1>
      <div className='btn rounded-full ml-auto text-black bg-white border-0 flex items-center gap-2'>
        <Send size={16} />
        <span>Post</span>
      </div>
      </div>
      <div className="h-0.5 rounded bg-black/50 mt-5 mb-10"></div>
    </div>
  )
}