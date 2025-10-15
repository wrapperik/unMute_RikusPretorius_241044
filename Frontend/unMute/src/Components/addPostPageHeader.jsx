import React from 'react'
import { Send } from 'lucide-react'
import BreadCrumbs from './breadCrumbs'

export default function AddPostPageHeader({ onPost, submitting }) {
  return (
    <div className="w-full mt-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
      <BreadCrumbs />
      <div className="flex ">
        <h1 className="text-black font-medium text-4xl text-left">New Post</h1>
        <button
          className='btn rounded-full ml-auto text-black bg-white border-0 flex items-center gap-2'
          type="button"
          onClick={onPost}
          disabled={submitting}
        >
          <Send size={16} />
          <span>{submitting ? 'Posting...' : 'Post'}</span>
        </button>
      </div>
      <div className="h-0.5 rounded bg-black/50 mt-5 mb-10"></div>
    </div>
  )
}