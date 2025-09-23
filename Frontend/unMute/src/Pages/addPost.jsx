import React from 'react'
import AddPostPageHeader from '../Components/addPostPageHeader'


export default function AddPostPage() {
    return(
        <>
       <AddPostPageHeader />  

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 rounded-3xl" data-theme="light">

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Title your post</legend>
                <input type="text" className="input" placeholder="Type here" />
                <p className="label">Let people know what your post is about</p>
            </fieldset>

        </div>
       </>
    )
}