import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Flag, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';

export default function PostCard({ post, onDelete }) {
  const { user } = useContext(AuthContext);
  const [showReactions, setShowReactions] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [likes, setLikes] = useState(post.likes || { count: 0, liked_by_user: false });
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

  const handleMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setShowReactions(true);
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => setShowReactions(false), 400);
    setTimeoutId(id);
  };

  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

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

  const handleClick = () => {
    navigate(`/viewpost/${post.id}`, { state: { postTitle: post.title, from: '/explore' } });
  };

  return (
    <div className="relative container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="card-body card bg-secondary/25 card-md rounded-3xl text-black shadow-sm m-2 h-auto cursor-pointer" onClick={handleClick}>
        <div className="flex">
          <h2 className="card-title flex-start">
            {post.title}
            <span className="ml-3 text-sm text-black/50">
              by {post.raw && post.raw.is_anonymous ? 'Anonymous' : (post.username || '')}
            </span>
          </h2>
          <div className="flex-end ml-auto flex items-center gap-2">
            <p>{post.time}</p>
            <h4 className={`card-title text-sm px-2 rounded-full ${post.topic ? 'bg-white border-1 border-base-500' : 'bg-white border-1 border-base-500'}`}>{post.topic}</h4>
          </div>
        </div>
        <div className="h-0.5 w-full rounded bg-black/10"></div>
        <p className="text-sm text-gray-800 line-clamp-4" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.description}
        </p>
      </div>
      <AnimateHolder show={showReactions} posts={{}} canDelete={canDelete} likes={likes} onDelete={handleDelete} post={post} navigate={navigate} setLikes={setLikes} user={user} />
    </div>
  );
}

function AnimateHolder({ show, canDelete, likes, onDelete, post, navigate, setLikes, user }) {
  return (
    <>
      {show && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute left-0 right-4 -bottom-3 flex justify-end gap-2 px-2 mt-10"
          style={{ pointerEvents: 'none' }}
        >
          <div className="rounded-full h-11 w-11 bg-white text-black items-center justify-center border border-0.5 border-gray-200 flex transform transition duration-200 ease-in-out hover:scale-[1.10] hover:shadow-md cursor-pointer" style={{ pointerEvents: 'auto' }}>
            <Flag size={16} />
          </div>
          <div className="rounded-full h-11 w-11 bg-white text-black items-center justify-center border border-0.5 border-gray-200 flex transform transition duration-200 ease-in-out hover:scale-[1.10] hover:shadow-md cursor-pointer" style={{ pointerEvents: 'auto' }}>
            <div onClick={e => { e.stopPropagation(); navigate(`/viewpost/${post.id}`, { state: { postTitle: post.title, from: '/explore', scrollToComments: true } }); }} aria-label="View comments">
              <MessageCircle size={16} />
            </div>
          </div>
          <div className="rounded-full h-11 w-11 bg-white text-black items-center justify-center flex border border-0.5 border-gray-200 transform transition duration-200 ease-in-out hover:scale-[1.10] hover:shadow-md cursor-pointer" style={{ pointerEvents: 'auto' }}>
            <motion.button
              aria-label={likes.liked_by_user ? 'Unlike' : 'Like'}
              onClick={e => { e.stopPropagation();
                if (!user || !user.token) { navigate('/login'); return; }
                const prev = { ...likes };
                const newLiked = !likes.liked_by_user;
                setLikes({ count: newLiked ? likes.count + 1 : Math.max(0, likes.count - 1), liked_by_user: newLiked });
                fetch(`${API_BASE}/posts/${post.id}/like`, {
                  method: 'POST',
                  headers: { 'Authorization': `Bearer ${user.token}` }
                })
                  .then(async res => {
                    const body = await res.text();
                    let json;
                    try { json = JSON.parse(body); } catch(e) { json = body; }
                    if (!json || json.status !== 'ok') {
                      setLikes(prev);
                    }
                  })
                  .catch(err => { setLikes(prev); });
              }}
              className="flex items-center justify-center"
              initial={false}
              animate={likes.liked_by_user ? { scale: 1.15 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              whileTap={{ scale: 1.6 }}
            >
              <Heart size={16} className={likes.liked_by_user ? 'liked-heart' : ''} />
            </motion.button>
          </div>
          {canDelete && (
            <div className="rounded-full h-11 w-11 bg-white text-red-600 items-center justify-center flex border border-0.5 border-gray-200 transform transition duration-200 ease-in-out hover:scale-[1.10] hover:shadow-md cursor-pointer" style={{ pointerEvents: 'auto' }} onClick={e => { e.stopPropagation(); onDelete(e); }} title="Delete post">
              <Trash2 size={16} />
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}
