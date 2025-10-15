import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Heart, MessageCircle, Flag, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';

function formatTimeSince(date) {
  if (!date) return '';
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

export default function JournalEntryCard({ entry, onDelete }) {
  const { user } = useContext(AuthContext);
  const [showReactions, setShowReactions] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const [likes, setLikes] = useState({ count: 0, liked_by_user: false });
  const navigate = useNavigate();
  const canDelete = user && (user.id === entry.user_id || user.is_admin);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if(!window.confirm('Are you sure you want to permanently delete this journal entry? This action cannot be undone.')) return;
    try {
      const res = await fetch (`${API_BASE}/journal/${entry.entry_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization':`Bearer ${user && user.token}`
        }
      });
      const json = await res.json();
      if (json.status === 'ok') {
        if(typeof onDelete === 'function') onDelete(entry.entry_id);
      } else {
        alert(json.error || 'Failed to delete entry');
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

  const createdAt = entry.created_at ? new Date(entry.created_at) : null;

  const moodMap = {
    'frustrated': { label: 'Frustrated'},
    'sad': { label: 'Sad'},
    'indifferent': { label: 'Indifferent'},
    'happy': { label: 'Happy'},
    'excited': { label: 'Excited'},
  };
  const moodForEntry = entry.mood || entry.mood_label || null;

  const handleClick = () => {
    // For journal entries we might show a dedicated view page later; reuse viewpost route for now
    navigate(`/viewentry/${entry.entry_id}`, { state: { entryTitle: entry.title, from: '/journal' } });
  };

  return (
    <div className="relative container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="card-body card bg-[#f7f7f7] card-md rounded-3xl text-black shadow-sm m-2 h-auto cursor-pointer" onClick={handleClick}>
        <div className="flex">
          <h2 className="card-title flex-start">
            {entry.title || `Entry ${entry.entry_id}`}
            <span className="ml-3 text-sm text-black/50">
              by {
                // Prefer an explicit username if the API provided one
                entry.username ? entry.username
                // If no username on the entry, but the logged-in user matches the entry owner, use their username
                : (user && user.id === entry.user_id ? (user.username || 'You')
                // Fallback to the numeric id as before
                : (entry.user_id ? `User ${entry.user_id}` : 'Unknown'))
              }
            </span>
          </h2>
          <div className="flex-end ml-auto flex items-center gap-2">
            <p>{formatTimeSince(createdAt)}</p>
            {moodForEntry ? (
              (() => {
                const m = moodMap[moodForEntry] || { label: moodForEntry, emoji: '' };
                return <h4 className={`card-title text-sm px-3 rounded-full bg-white border-1 border-base-500`}>{m.emoji} {m.label}</h4>;
              })()
            ) : (
              <h4 className={`card-title text-sm px-2 rounded-full bg-white border-1 border-base-500`}>Journal</h4>
            )}
          </div>
        </div>
        <div className="h-0.5 w-full rounded bg-black/10"></div>
        <p className="text-sm text-gray-800 line-clamp-4" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {entry.content}
        </p>
      </div>
      <AnimateHolder show={showReactions} canDelete={canDelete} onDelete={handleDelete} entry={entry} navigate={navigate} likes={likes} setLikes={setLikes} user={user} />
    </div>
  );
}

function AnimateHolder({ show, canDelete, likes, onDelete, entry, navigate, setLikes, user }) {
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
          {/* Only delete action is shown for journal entries per requirements */}
          {canDelete && (
            <div className="rounded-full h-11 w-11 bg-white text-red-600 items-center justify-center flex border border-0.5 border-gray-200 transform transition duration-200 ease-in-out hover:scale-[1.10] hover:shadow-md cursor-pointer" style={{ pointerEvents: 'auto' }} onClick={e => { e.stopPropagation(); onDelete(e); }} title="Delete entry">
              <Trash2 size={16} />
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}
