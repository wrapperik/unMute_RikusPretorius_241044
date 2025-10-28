import React, { useState, useEffect, useContext, useRef } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Flag, Trash2, Share2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';


export default function PostCard({ post, onDelete }) {
  const { user } = useContext(AuthContext);
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

  // Title marquee handling: when title overflows, on hover animate it horizontally in a loop
  const titleContainerRef = useRef(null);
  const titleInnerRef = useRef(null);
  const rafRef = useRef(null);
  const [needsScroll, setNeedsScroll] = useState(false);

  useEffect(() => {
    const container = titleContainerRef.current;
    const inner = titleInnerRef.current;
    if (!container || !inner) return;
    const overflow = inner.scrollWidth > container.clientWidth + 2;
    setNeedsScroll(overflow);
  }, [post.title]);

  const startTitleMarquee = () => {
    const container = titleContainerRef.current;
    const inner = titleInnerRef.current;
    if (!container || !inner) return;
    const maxTranslate = inner.scrollWidth - container.clientWidth;
    if (maxTranslate <= 0) return;
    const speed = 60; // px per second
    let direction = -1; // move left
    let lastTime = null;
    let current = 0;

    const step = (time) => {
      if (!lastTime) lastTime = time;
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      current += dt * speed * (direction === -1 ? 1 : -1);
      if (current >= maxTranslate) {
        // reached far left, pause briefly then reset to 0
        current = maxTranslate;
        inner.style.transform = `translateX(${-current}px)`;
        // pause then reverse direction
        setTimeout(() => {
          direction = 1; // move right
          lastTime = null;
        }, 700);
      } else if (current <= 0 && direction === 1) {
        current = 0;
        inner.style.transform = `translateX(0px)`;
        // pause then go left again
        setTimeout(() => {
          direction = -1;
          lastTime = null;
        }, 700);
      } else {
        inner.style.transform = `translateX(${-current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const stopTitleMarquee = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (titleInnerRef.current) titleInnerRef.current.style.transform = 'translateX(0)';
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/viewpost/${post.id}`;
    const shareData = { title: post.title, text: post.description?.slice(0, 140), url };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      // fallback: copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => alert('Link copied to clipboard'))
          .catch(() => alert('Could not copy link'));
      } else {
        // last resort
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); alert('Link copied to clipboard'); } catch { alert('Could not copy link'); }
        ta.remove();
      }
    }
  };

  // Calculate dynamic line clamp based on content length
  const getLineClamp = () => {
    const contentLength = post.description.length;
    if (contentLength < 100) return 3;
    if (contentLength < 200) return 5;
    if (contentLength < 400) return 8;
    return 12;
  };

  return (
    <div className="w-full">{/* full-width row container - ensures one post per row */}
      <div className="w-full md:max-w-3xl lg:max-w-4xl ml-auto flex items-start gap-4 rounded-2xl text-black p-4 h-auto cursor-pointer transition-all duration-200 hover:border hover:border-gray-200 hover:shadow-md transform hover:scale-105" onClick={handleClick}>
        {/* Left: Avatar */}
        <div className="flex-shrink-0 w-12">
          {(post.raw?.profile_picture || post.profile_picture) ? (
            <img 
              src={`/${post.raw?.profile_picture || post.profile_picture}`} 
              alt={`${post.username}'s avatar`}
              className="w-10 h-10 rounded-full object-cover shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-800 via-green-750 to-green-900 flex items-center justify-center text-white font-bold text-sm">
              {(post.username || 'A').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {/* Title container with marquee-on-hover when overflowing */}
              <div ref={titleContainerRef} onMouseEnter={() => { if (needsScroll) startTitleMarquee(); }} onMouseLeave={() => { if (needsScroll) stopTitleMarquee(); }} className="overflow-hidden whitespace-nowrap">
                <h2 className="card-title font-bold text-base leading-tight" style={{ display: 'inline-block' }}>
                  <span ref={titleInnerRef} style={{ display: 'inline-block', willChange: 'transform', transition: 'transform 0.1s linear' }}>{post.title}</span>
                </h2>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">by {post.raw && post.raw.is_anonymous ? 'Anonymous' : (post.username || 'Unknown')}</span>
                <span className="text-xs font-medium text-gray-400">• {post.time}</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <h4 className={`text-xs px-3 py-1 rounded-full font-semibold border-2 border-black bg-white whitespace-nowrap`}>{post.topic}</h4>
            </div>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed mt-3 break-words" style={{
            display: '-webkit-box',
            WebkitLineClamp: getLineClamp(),
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {post.description}
          </p>

          {/* Bottom persistent reaction bar */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
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
                  className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100"
                  initial={false}
                  animate={likes.liked_by_user ? { scale: 1.05 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart size={16} className={likes.liked_by_user ? 'liked-heart text-red-600' : 'text-gray-600'} />
                </motion.button>
                <span className="text-xs text-gray-500">{likes.count}</span>

                <button onClick={e => { e.stopPropagation(); navigate(`/viewpost/${post.id}`, { state: { postTitle: post.title, from: '/explore', scrollToComments: true } }); }} className="p-2 rounded-full hover:bg-gray-100">
                  <MessageCircle size={16} />
                </button>

                <button onClick={e => { e.stopPropagation(); if (!user || !user.token) { navigate('/login'); return; } if (!confirm('Flag this post for review?')) return; fetch(`${API_BASE}/posts/${post.id}/flag`, { method: 'POST', headers: { 'Authorization': `Bearer ${user.token}` } }).then(res => res.json()).then(json => { if (json.status === 'ok') { alert('Post flagged for review'); } else { alert(json.error || 'Failed to flag post'); } }).catch(() => alert('Network error')); }} className="p-2 rounded-full hover:bg-gray-100">
                  <Flag size={16} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={e => { e.stopPropagation(); handleShare(e); }} className="p-2 rounded-full hover:bg-gray-100" aria-label="Share post">
                <Share2 size={16} />
              </button>
              {canDelete && (
                <button onClick={e => { e.stopPropagation(); handleDelete(e); }} className="p-2 rounded-full text-red-600 hover:bg-red-50" title="Delete post">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* AnimateHolder removed in favor of a persistent bottom bar for better UX */
