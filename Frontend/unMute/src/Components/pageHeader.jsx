import React from 'react'
import { Plus } from 'lucide-react'

export default function PageHeader() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
      <div className="flex mt-10">
      <h1 className="text-black  font-medium text-4xl text-left">Explore</h1>
      <div className='btn rounded-full ml-auto text-black bg-white border-0 flex items-center gap-2'>
        <Plus size={16} />
        <span>Create Post</span>
      </div>
      </div>
      <div className="h-0.5 rounded bg-black/50 mt-5 mb-10"></div>
    </div>
  )
}