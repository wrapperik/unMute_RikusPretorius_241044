import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ViewPostPageHeader from '../Components/viewPostPageHeader';
import CommentSection from '../Components/commentSection';
import { motion } from 'framer-motion';
import { Heart, Trash2, XCircle, AlertTriangle, MessageCircle, Flag, Share2, MoreHorizontal } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';

const topicColors = {
    Joy: 'bg-yellow-100 border border-yellow-300 text-yellow-900',
    Stress: 'bg-red-100 border border-red-300 text-red-900',
    Anxiety: 'bg-blue-100 border border-blue-300 text-blue-900',
    Depression: 'bg-purple-100 border border-purple-300 text-purple-900',
    Motivation: 'bg-green-100 border border-green-300 text-green-900',
    Other: 'bg-gray-100 border border-gray-300 text-gray-900',
};

const topicGradients = {
    Joy: 'from-yellow-400 to-orange-400',
    Stress: 'from-red-400 to-pink-500',
    Anxiety: 'from-blue-400 to-cyan-500',
    Depression: 'from-purple-400 to-indigo-500',
    Motivation: 'from-green-400 to-emerald-500',
    Other: 'from-gray-400 to-slate-500',
};

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
    const navigate = useNavigate();
    const postTitle = state && state.postTitle;
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showActions, setShowActions] = useState(false);
    const [commentsCount, setCommentsCount] = useState(0);
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

    // Load comments count
    useEffect(() => {
        let mounted = true;
        fetch(`${API_BASE}/posts/${id}/comments`)
            .then(res => res.json())
            .then(json => {
                if (!mounted) return;
                if (json.status === 'ok' && json.data) {
                    setCommentsCount(json.data.length);
                }
            })
            .catch(() => {});
        return () => { mounted = false; };
    }, [id]);

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

    const handleLike = async () => {
        if (!user || !user.token) { 
            navigate('/login'); 
            return; 
        }
        
        const prev = { ...likes };
        const newLiked = !likes.liked_by_user;
        const newLikes = { count: newLiked ? likes.count + 1 : Math.max(0, likes.count - 1), liked_by_user: newLiked };
        setLikes(newLikes);
        
        try {
            const res = await fetch(`${API_BASE}/posts/${id}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const json = await res.json();
            if (!json || json.status !== 'ok') {
                setLikes(prev);
            }
        } catch (err) {
            setLikes(prev);
        }
    };

    const handleFlag = async () => {
        if (!user || !user.token) { 
            alert('Please login to flag posts'); 
            return; 
        }
        if (!confirm('Flag this post for review?')) return;
        
        try {
            const res = await fetch(`${API_BASE}/posts/${id}/flag`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const json = await res.json();
            if (json.status === 'ok') {
                alert('Post flagged for review');
            } else {
                alert(json.error || 'Failed to flag post');
            }
        } catch (err) {
            alert('Network error');
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: post?.title || 'Post',
                text: post?.content?.slice(0, 100) + '...' || '',
                url: url
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <>
            <ViewPostPageHeader />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004643]"></div>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                )}
                
                {post && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content - Left Side (2/3 width on desktop) */}
                        <div className="lg:col-span-2">
                            {/* Admin Controls Banner */}
                            {isAdmin && post.is_flagged && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
                                >
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-red-600" />
                                        <span className="font-semibold text-red-900">This post has been flagged</span>
                                        <span className="ml-auto text-xs text-red-600">
                                            {formatTimeSince(post.flagged_at)}
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Post Card */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                            >
                                {/* Post Header */}
                                <div className="px-6 pt-6 pb-4">
                                    <div className="flex gap-3">
                                        {/* Avatar with gradient based on topic */}
                                        <div className={`flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br ${topicGradients[post.topic] || topicGradients.Other} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
                                            {(post.is_anonymous ? 'A' : (post.username || 'U')[0]).toUpperCase()}
                                        </div>
                                        
                                        {/* User Info & Topic */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-bold text-base text-gray-900">
                                                        {post.is_anonymous ? 'Anonymous' : (post.username || 'Unknown')}
                                                    </span>
                                                    <span className="text-gray-500 text-sm">{formatTimeSince(post.created_at)}</span>
                                                </div>
                                                <button
                                                    onClick={() => setShowActions(!showActions)}
                                                    className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                    aria-label="More options"
                                                >
                                                    <MoreHorizontal size={20} className="text-gray-500" />
                                                </button>
                                            </div>
                                            <span className={`inline-block mt-2 text-xs px-3 py-1.5 rounded-full font-semibold ${topicColors[post.topic] || topicColors.Other}`}>
                                                {post.topic}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Post Content */}
                                <div className="px-6 pb-6">
                                    <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
                                    <div className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {post.content}
                                    </div>
                                </div>

                                {/* Engagement Bar */}
                                <div className="px-6 py-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-gray-500 text-sm">
                                        <div className="flex items-center gap-6">
                                            <span className="font-medium">
                                                {likes.count} {likes.count === 1 ? 'like' : 'likes'}
                                            </span>
                                            <span className="font-medium">
                                                {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
                                    <motion.button
                                        onClick={handleLike}
                                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                                            likes.liked_by_user 
                                                ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Heart 
                                            size={20} 
                                            className={likes.liked_by_user ? 'fill-red-600' : ''} 
                                        />
                                        <span>Like</span>
                                    </motion.button>

                                    <motion.button
                                        onClick={() => {
                                            const el = document.getElementById('comment-section');
                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-all"
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <MessageCircle size={20} />
                                        <span>Comment</span>
                                    </motion.button>

                                    <motion.button
                                        onClick={handleShare}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-all"
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Share2 size={20} />
                                        <span>Share</span>
                                    </motion.button>
                                </div>

                                {/* More Actions Dropdown */}
                                {showActions && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="absolute right-6 top-20 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[160px]"
                                    >
                                        <button
                                            onClick={handleFlag}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Flag size={16} />
                                            Report Post
                                        </button>
                                        {isAdmin && (
                                            <>
                                                <button
                                                    onClick={handleDeletePost}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                                                >
                                                    <Trash2 size={16} />
                                                    Delete Post
                                                </button>
                                                {post.is_flagged && (
                                                    <button
                                                        onClick={handleDismissFlag}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors border-t border-gray-100"
                                                    >
                                                        <XCircle size={16} />
                                                        Dismiss Flag
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                        </div>

                        {/* Comment Section - Right Side (1/3 width on desktop) */}
                        <div className="lg:col-span-1">
                            <div id="comment-section">
                                <CommentSection postId={id} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}