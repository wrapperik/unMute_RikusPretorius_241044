import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Flag, Trash2, MoreHorizontal, Share2, Bookmark } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'

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

export default function PostCard({ post, onDelete, onLikesUpdate }) {
  const { user } = useContext(AuthContext);
  const [showActions, setShowActions] = useState(false);
  const [likes, setLikes] = useState(post.likes || { count: 0, liked_by_user: false });
  const [commentsCount, setCommentsCount] = useState(0);
  const navigate = useNavigate();
  const canDelete = user && (user.id === post.raw.user_id || user.is_admin);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if(!window.confirm('Are you sure you want to permanently delete this post? This action cannot be undone.')) return;
    try {
      const res = await fetch (`${API_BASE}/posts/${post.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization':`Bearer ${user.token}`
        }
      });
      const json = await res.json();
      if (json.status === 'ok') {
        if(typeof onDelete === 'function') onDelete(post.id);
      } else {
        alert(json.error || 'Failed to delete post');
      } 
    } catch (err) {
      alert('Network error');
    }
  };

  // Load likes for this post when component mounts (only if not already loaded)
  useEffect(() => {
    if (post.likes && post.likes.count > 0) {
      // Likes already loaded from parent, just sync local state
      setLikes(post.likes);
      return;
    }
    
    let mounted = true;
    fetch(`${API_BASE}/posts/${post.id}/likes`, {
      headers: user && user.token ? { Authorization: `Bearer ${user.token}` } : {}
    })
      .then(res => res.json())
      .then(json => {
        if (!mounted) return;
        if (json.status === 'ok' && json.data) {
          setLikes(json.data);
          if (onLikesUpdate) {
            onLikesUpdate(post.id, json.data);
          }
        }
      })
      .catch(() => {})
    return () => { mounted = false; };
  }, [post.id, post.likes, user, onLikesUpdate]);

  // Load comments count
  useEffect(() => {
    let mounted = true;
    fetch(`${API_BASE}/posts/${post.id}/comments`)
      .then(res => res.json())
      .then(json => {
        if (!mounted) return;
        if (json.status === 'ok' && json.data) {
          setCommentsCount(json.data.length);
        }
      })
      .catch(() => {})
    return () => { mounted = false; };
  }, [post.id]);

  const handleClick = () => {
    navigate(`/viewpost/${post.id}`, { state: { postTitle: post.title, from: '/explore' } });
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user || !user.token) { 
      navigate('/login'); 
      return; 
    }
    
    const prev = { ...likes };
    const newLiked = !likes.liked_by_user;
    const newLikes = { count: newLiked ? likes.count + 1 : Math.max(0, likes.count - 1), liked_by_user: newLiked };
    setLikes(newLikes);
    
    // Update parent state immediately for sorting
    if (onLikesUpdate) {
      onLikesUpdate(post.id, newLikes);
    }
    
    try {
      const res = await fetch(`${API_BASE}/posts/${post.id}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const json = await res.json();
      if (!json || json.status !== 'ok') {
        setLikes(prev);
        if (onLikesUpdate) {
          onLikesUpdate(post.id, prev);
        }
      }
    } catch (err) {
      setLikes(prev);
      if (onLikesUpdate) {
        onLikesUpdate(post.id, prev);
      }
    }
  };

  const handleFlag = async (e) => {
    e.stopPropagation();
    if (!user || !user.token) { 
      navigate('/login'); 
      return; 
    }
    if (!confirm('Flag this post for review?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/posts/${post.id}/flag`, {
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

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/viewpost/${post.id}`;
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description.slice(0, 100) + '...',
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <motion.div 
      className="relative bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
      whileHover={{ y: -2 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div 
        className="cursor-pointer" 
        onClick={handleClick}
      >
        {/* Post Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex gap-3">
            {/* Avatar with gradient based on topic */}
            <div className={`flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br ${topicGradients[post.topic] || topicGradients.Other} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
              {(post.raw && post.raw.is_anonymous ? 'A' : (post.username || 'U')[0]).toUpperCase()}
            </div>
            
            {/* User Info & Topic */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="font-bold text-sm text-gray-900 truncate">
                    {post.raw && post.raw.is_anonymous ? 'Anonymous' : (post.username || 'Unknown')}
                  </span>
                  <span className="text-gray-400 text-xs">·</span>
                  <span className="text-gray-500 text-xs">{post.time}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(!showActions);
                  }}
                  className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="More options"
                >
                  <MoreHorizontal size={16} className="text-gray-500" />
                </button>
              </div>
              <span className={`inline-block mt-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${topicColors[post.topic] || topicColors.Other}`}>
                {post.topic}
              </span>
            </div>
          </div>
        </div>

        {/* Post Content */}
        <div className="px-4 pb-3">
          <h2 className="font-bold text-base text-gray-900 leading-tight mb-2">
            {post.title}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {post.description}
          </p>
        </div>

        {/* Engagement Bar */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <div className="flex items-center gap-4">
              <span className="font-medium">
                {likes.count} {likes.count === 1 ? 'like' : 'likes'}
              </span>
              <span className="font-medium">
                {commentsCount} {commentsCount === 1 ? 'comment' : 'comments'}
              </span>
            </div>
            <span className="text-gray-400 hidden sm:block">Click to read more</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-2 py-2 border-t border-gray-100 flex items-center justify-between gap-1">
          <motion.button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
              likes.liked_by_user 
                ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <Heart 
              size={18} 
              className={likes.liked_by_user ? 'fill-red-600' : ''} 
            />
            <span className="hidden sm:inline">Like</span>
          </motion.button>

          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/viewpost/${post.id}`, { state: { postTitle: post.title, from: '/explore', scrollToComments: true } });
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle size={18} />
            <span className="hidden sm:inline">Comment</span>
          </motion.button>

          <motion.button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <Share2 size={18} />
            <span className="hidden sm:inline">Share</span>
          </motion.button>
        </div>
      </div>

      {/* More Actions Dropdown */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute right-4 top-14 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[160px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleFlag}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Flag size={16} />
            Report Post
          </button>
          {canDelete && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
            >
              <Trash2 size={16} />
              Delete Post
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
