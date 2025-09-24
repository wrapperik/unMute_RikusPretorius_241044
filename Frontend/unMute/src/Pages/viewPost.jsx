import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ViewPostPageHeader from '../Components/viewPostPageHeader';
import CommentSection from '../Components/commentSection';
import { Heart } from 'lucide-react'
import { MessageCircle } from 'lucide-react'
import { Flag } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';

// Helper to format time since post creation
function formatTimeSince(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const sec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
}

export default function ViewPostPage() {
    const { id } = useParams();
    const { state } = useLocation();
    const postTitle = state && state.postTitle;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/posts/${id}`)
            .then(res => res.json())
            .then(data => {
                setPost(data);
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to load post');
                setLoading(false);
            });
    }, [id]);

    return (
        <>
            <ViewPostPageHeader />
            <div className="container mx-auto p-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 ">
                {loading && <p>Loading post...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {post && (
                    <>
                        <h1 className="text-3xl text-black font-bold mb-2">{post.title}</h1>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-lg text-black">By {post.is_anonymous ? 'Anonymous' : (post.username || '')} | {formatTimeSince(post.created_at)}</span>
                            <h4 className="card-title text-black text-sm px-2 rounded-full bg-[#DED5E6] inline-block">{post.topic}</h4>
                            <div className="flex items-center gap-2 ml-auto">
                                <div className="rounded-full h-11 w-11 bg-white text-black items-center justify-center border border-0.5 border-gray-200 flex transform transition duration-200 ease-in-out hover:scale-[1.10] hover:shadow-md cursor-pointer">
                                    <Heart size={20} />
                                </div>
                                <div className="rounded-full h-11 w-11 bg-white text-black items-center justify-center border border-0.5 border-gray-200 flex transform transition duration-200 ease-in-out hover:scale-[1.10] hover:shadow-md cursor-pointer">
                                    <Flag size={20} />
                                </div>
                            </div>
                        </div>
                        <div className="h-0.5 w-full rounded bg-black/10 mb-4"></div>
                        <div className="text-lg text-black">{post.content}</div>
                    </>
                )}

                <CommentSection />
            </div>

        </>
    );
}

