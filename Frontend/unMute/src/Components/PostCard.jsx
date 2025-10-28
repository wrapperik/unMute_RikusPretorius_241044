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

export default function PostCard({ post, onDelete }) {
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

  // Load likes for this post when component mounts
  useEffect(() => {
    let mounted = true;
    fetch(`${API_BASE}/posts/${post.id}/likes`, {
      headers: user && user.token ? { Authorization: `Bearer ${user.token}` } : {}
    })
      .then(res => res.json())
      .then(json => {
        if (!mounted) return;
        if (json.status === 'ok' && json.data) {
          setLikes(json.data);
        }
      })
      .catch(() => {})
    return () => { mounted = false; };
  }, [post.id, user]);

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
    setLikes({ count: newLiked ? likes.count + 1 : Math.max(0, likes.count - 1), liked_by_user: newLiked });
    
    try {
      const res = await fetch(`${API_BASE}/posts/${post.id}/like`, {
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
    <motion.article 
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group"
      whileHover={{ y: -2 }}
      onClick={handleClick}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Avatar with gradient based on topic */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${topicGradients[post.topic] || topicGradients.Other} flex items-center justify-center text-white font-bold text-base shadow-md`}>
            {(post.raw && post.raw.is_anonymous ? 'A' : (post.username || 'U')[0]).toUpperCase()}
          </div>
          
          {/* User info and metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <span className="font-bold text-gray-900 text-sm truncate">
                  {post.raw && post.raw.is_anonymous ? 'Anonymous' : (post.username || 'Unknown')}
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-500 text-sm flex-shrink-0">{post.time}</span>
              </div>
              
              {/* More options button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal size={18} className="text-gray-500" />
              </button>
            </div>
            
            {/* Topic badge */}
            <div className="mt-1">
              <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-semibold ${topicColors[post.topic] || topicColors.Other}`}>
                {post.topic}
              </span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="space-y-2 mb-4 cursor-pointer">
          <h2 className="font-bold text-lg text-gray-900 leading-tight hover:text-[#004643] transition-colors">
            {post.title}
          </h2>
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {post.description}
          </p>
        </div>
        
        {/* Engagement bar */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {/* Left: Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 hover:text-red-500 transition-colors ${likes.liked_by_user ? 'text-red-500' : ''}`}
            >
              <motion.div
                whileTap={{ scale: 1.3 }}
                animate={likes.liked_by_user ? { scale: [1, 1.2, 1] } : {}}
              >
                <Heart 
                  size={18} 
                  className={likes.liked_by_user ? 'fill-red-500' : ''} 
                />
              </motion.div>
              <span className="font-medium">{likes.count || 0}</span>
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/viewpost/${post.id}`, { state: { postTitle: post.title, from: '/explore', scrollToComments: true } });
              }}
              className="flex items-center gap-1.5 hover:text-[#004643] transition-colors"
            >
              <MessageCircle size={18} />
              <span className="font-medium">{commentsCount || 0}</span>
            </button>
          </div>
          
          {/* Right: Action buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-[#004643] transition-colors"
              whileTap={{ scale: 0.9 }}
              aria-label="Share"
            >
              <Share2 size={16} />
            </motion.button>
            
            <motion.button
              onClick={handleFlag}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-orange-500 transition-colors"
              whileTap={{ scale: 0.9 }}
              aria-label="Report"
            >
              <Flag size={16} />
            </motion.button>
            
            {canDelete && (
              <motion.button
                onClick={handleDelete}
                className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </motion.button>
            )}
          </div>
        </div>
      </div>
      
      {/* Actions dropdown */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-4 top-16 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10 min-w-[160px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleShare}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Share2 size={16} />
            Share Post
          </button>
          <button
            onClick={handleFlag}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-orange-600"
          >
            <Flag size={16} />
            Report Post
          </button>
          {canDelete && (
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
            >
              <Trash2 size={16} />
              Delete Post
            </button>
          )}
        </motion.div>
      )}
    </motion.article>
  );
}
