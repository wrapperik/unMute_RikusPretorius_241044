import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ViewPostPageHeader from '../Components/viewPostPageHeader';
import CommentSection from '../Components/commentSection';
import { motion } from 'framer-motion';
import { Heart, Trash2, XCircle, AlertTriangle } from 'lucide-react'
import { MessageCircle } from 'lucide-react'
import { Flag } from 'lucide-react'
import { AuthContext } from '../context/AuthContext';

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
    const topicColors = {
        Joy: 'bg-yellow-50 border-2 border-yellow-200',
        Stress: 'bg-red-50 border-2 border-red-200',
        Anxiety: 'bg-blue-50 border-2 border-blue-200',
        Depression: 'bg-purple-50 border-2 border-purple-200',
        Motivation: 'bg-green-50 border-2 border-green-200',
        Other: 'bg-gray-50 border-2 border-gray-200',
    };
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const postTitle = state && state.postTitle;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);
    const [likes, setLikes] = useState({ count: 0, liked_by_user: false });
    const isAdmin = user && (user.is_admin || user.isAdmin);

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

    // If we navigated here asking to scroll to comments, do it after post loads
    useEffect(() => {
        if (!state || !state.scrollToComments) return;
        // small timeout to allow DOM to render
        const t = setTimeout(() => {
            const el = document.getElementById('comment-section');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
        return () => clearTimeout(t);
    }, [state, post]);

        // Load likes
        useEffect(() => {
            let mounted = true;
            fetch(`${API_BASE}/posts/${id}/likes`, {
                headers: user && user.token ? { Authorization: `Bearer ${user.token}` } : {}
            })
                .then(res => res.json())
                .then(json => {
                    if (!mounted) return;
                    if (json.status === 'ok' && json.data) setLikes(json.data);
                })
                .catch(() => {});
            return () => { mounted = false; };
        }, [id, user]);

    const handleDeletePost = async () => {
        if (!confirm('Delete this post permanently? This action cannot be undone.')) return;
        try {
            const res = await fetch(`${API_BASE}/admin/posts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const json = await res.json();
            if (res.ok && json.status === 'ok') {
                alert('Post deleted successfully');
                navigate('/explore');
            } else {
                alert(json.error || 'Failed to delete post');
            }
        } catch (err) {
            alert('Network error');
        }
    };

    const handleDismissFlag = async () => {
        if (!confirm('Remove flag from this post?')) return;
        try {
            const res = await fetch(`${API_BASE}/admin/posts/${id}/unflag`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const json = await res.json();
            if (res.ok && json.status === 'ok') {
                alert('Flag dismissed');
                setPost(prev => ({ ...prev, is_flagged: false, flagged_at: null }));
            } else {
                alert(json.error || 'Failed to dismiss flag');
            }
        } catch (err) {
            alert('Network error');
        }
    };

    return (
        <>
            <ViewPostPageHeader />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading && <p>Loading post...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {post && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content - Left Side (2/3 width on desktop) */}
                        <div className="lg:col-span-2">
                            <h1 className="text-3xl text-black font-bold mb-2">{post.title}</h1>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-lg text-black">By {post.is_anonymous ? 'Anonymous' : (post.username || '')} | {formatTimeSince(post.created_at)}</span>
                                <h4 className={`card-title text-sm text-black px-2 rounded-full inline-block ${topicColors[post.topic] || topicColors.Other}`}>{post.topic}</h4>
                                <div className="flex items-center gap-2 ml-auto">
                                                                <div className="rounded-full h-11 w-11 bg-white text-black items-center justify-center border border-0.5 border-gray-200 flex transform transition duration-200 ease-in-out hover:scale-[1.10] hover:shadow-md cursor-pointer">
                                                                        <motion.button
                                                                            aria-label={likes.liked_by_user ? 'Unlike' : 'Like'}
                                                                            onClick={() => {
                                                                                if (!user || !user.token) return; // optionally redirect to login
                                                                                const prev = { ...likes };
                                                                                const newLiked = !likes.liked_by_user;
                                                                                setLikes({ count: newLiked ? likes.count + 1 : Math.max(0, likes.count - 1), liked_by_user: newLiked });
                                                                                        console.log('Calling POST /posts/' + id + '/like');
                                                                                        fetch(`${API_BASE}/posts/${id}/like`, {
                                                                                            method: 'POST',
                                                                                            headers: { Authorization: `Bearer ${user.token}` }
                                                                                        })
                                                                                            .then(async res => {
                                                                                                const body = await res.text();
                                                                                                let json;
                                                                                                try { json = JSON.parse(body); } catch(e) { json = body; }
                                                                                                console.log('Response:', res.status, json);
                                                                                                if (!json || json.status !== 'ok') setLikes(prev);
                                                                                            })
                                                                                            .catch(err => { console.error('Network error liking post:', err); setLikes(prev); });
                                                                            }}
                                                                            initial={false}
                                                                            animate={likes.liked_by_user ? { scale: 1.12 } : { scale: 1 }}
                                                                            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                        >
                                                                                                                                                            <Heart size={20} className={likes.liked_by_user ? 'liked-heart' : ''} />
                                                                        </motion.button>
                                                                </div>
                                <div 
                                    onClick={() => {
                                        if (!user || !user.token) { alert('Please login to flag posts'); return; }
                                        if (!confirm('Flag this post for review?')) return;
                                        fetch(`${API_BASE}/posts/${id}/flag`, {
                                            method: 'POST',
                                            headers: { 'Authorization': `Bearer ${user.token}` }
                                        })
                                            .then(res => res.json())
                                            .then(json => {
                                                if (json.status === 'ok') {
                                                    alert('Post flagged for review');
                                                } else {
                                                    alert(json.error || 'Failed to flag post');
                                                }
                                            })
                                            .catch(() => alert('Network error'));
                                    }}
                                    className="rounded-full h-11 w-11 bg-white text-black items-center justify-center border border-0.5 border-gray-200 flex transform transition duration-200 ease-in-out hover:scale-[1.10] hover:shadow-md cursor-pointer"
                                    aria-label="Flag post"
                                >
                                    <Flag size={20} />
                                </div>
                            </div>
                            </div>
                            <div className="h-0.5 w-full rounded bg-black/10 mb-4"></div>

                            {/* Admin Controls */}
                            {isAdmin && (
                            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="h-5 w-5 text-blue-600" />
                                    <h3 className="font-semibold text-blue-900">Admin Controls</h3>
                                    {post.is_flagged && (
                                        <span className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                            Flagged
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDeletePost}
                                        className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Post
                                    </button>
                                    {post.is_flagged && (
                                        <button
                                            onClick={handleDismissFlag}
                                            className="px-4 py-2 bg-white border-2 border-[#004643] text-[#004643] rounded-xl hover:bg-[#004643] hover:text-white transition-colors flex items-center gap-2 text-sm font-medium"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Dismiss Flag
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                            <div className="text-lg text-black leading-relaxed max-w-prose">
                                {post.content.split('\n').map((line, idx) => (
                                    <React.Fragment key={idx}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>

                        {/* Comment Section - Right Side (1/3 width on desktop) */}
                        <div className="lg:col-span-1">
                            <CommentSection postId={id} />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

