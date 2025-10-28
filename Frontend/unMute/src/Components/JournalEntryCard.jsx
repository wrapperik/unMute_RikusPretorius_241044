import React, { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { Trash2, MoreHorizontal, Share2, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';

const moodColors = {
  excited: 'bg-orange-100 border border-orange-300 text-orange-900',
  happy: 'bg-yellow-100 border border-yellow-300 text-yellow-900',
  indifferent: 'bg-gray-100 border border-gray-300 text-gray-900',
  sad: 'bg-blue-100 border border-blue-300 text-blue-900',
  frustrated: 'bg-red-100 border border-red-300 text-red-900',
};

const moodGradients = {
  excited: 'from-orange-400 to-red-400',
  happy: 'from-yellow-400 to-orange-400',
  indifferent: 'from-gray-400 to-slate-400',
  sad: 'from-blue-400 to-indigo-400',
  frustrated: 'from-red-400 to-pink-500',
};

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
  const [showActions, setShowActions] = useState(false);
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

  const createdAt = entry.created_at ? new Date(entry.created_at) : null;
  const moodForEntry = entry.mood || entry.mood_label || 'indifferent';

  const handleClick = () => {
    navigate(`/viewentry/${entry.entry_id}`, { state: { entryTitle: entry.title, from: '/journal' } });
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/viewentry/${entry.entry_id}`;
    if (navigator.share) {
      navigator.share({
        title: entry.title || 'Journal Entry',
        text: entry.content?.slice(0, 100) + '...' || '',
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
        {/* Entry Header */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex gap-3">
            {/* Avatar with gradient based on mood */}
            <div className={`flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br ${moodGradients[moodForEntry] || moodGradients.indifferent} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
              {(entry.username || 'U')[0].toUpperCase()}
            </div>
            
            {/* User Info & Mood */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="font-bold text-sm text-gray-900 truncate">
                    {entry.username || (user && user.id === entry.user_id ? (user.username || 'You') : `User ${entry.user_id || 'Unknown'}`)}
                  </span>
                  <span className="text-gray-400 text-xs">·</span>
                  <span className="text-gray-500 text-xs">{formatTimeSince(createdAt)}</span>
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
              <span className={`inline-block mt-1.5 text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${moodColors[moodForEntry] || moodColors.indifferent}`}>
                {moodForEntry}
              </span>
            </div>
          </div>
        </div>

        {/* Entry Content */}
        <div className="px-4 pb-3">
          <h2 className="font-bold text-base text-gray-900 leading-tight mb-2">
            {entry.title || `Entry ${entry.entry_id}`}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
            {entry.content}
          </p>
        </div>

        {/* View More Indicator */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-gray-500 text-xs">
            <span className="font-medium flex items-center gap-1">
              <Eye size={14} />
              Private Entry
            </span>
            <span className="text-gray-400 hidden sm:block">Click to read more</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-2 py-2 border-t border-gray-100 flex items-center gap-2">
          <motion.button
            onClick={handleClick}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 transition-all"
            whileTap={{ scale: 0.95 }}
          >
            <Eye size={18} />
            <span className="hidden sm:inline">View</span>
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
      {showActions && canDelete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute right-4 top-14 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[160px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={16} />
            Delete Entry
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}