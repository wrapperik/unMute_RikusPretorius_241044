import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ViewPostPageHeader from '../Components/viewPostPageHeader';
import { motion } from 'framer-motion';
import { Eye, Trash2, MoreHorizontal } from 'lucide-react'
import { AuthContext } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';

const moodColors = {
    excited: 'bg-orange-100 text-orange-700 border-orange-200',
    happy: 'bg-green-100 text-green-700 border-green-200',
    indifferent: 'bg-gray-100 text-gray-700 border-gray-200',
    sad: 'bg-blue-100 text-blue-700 border-blue-200',
    frustrated: 'bg-red-100 text-red-700 border-red-200'
};

const moodGradients = {
    excited: 'from-orange-400 to-orange-600',
    happy: 'from-green-400 to-emerald-600',
    indifferent: 'from-gray-400 to-gray-600',
    sad: 'from-blue-400 to-blue-600',
    frustrated: 'from-red-400 to-red-600'
};

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

export default function ViewEntryPage() {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const entryTitle = state && state.entryTitle;
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showActions, setShowActions] = useState(false);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        let mounted = true;
        fetch(`${API_BASE}/journal/${id}`, {
            headers: user && user.token ? { Authorization: `Bearer ${user.token}` } : {}
        })
            .then(async res => {
                const ct = res.headers.get('content-type') || '';
                if (!ct.includes('application/json')) throw new Error('Unexpected response');
                return res.json();
            })
            .then(data => {
                if (!mounted) return;
                if (data && data.status === 'ok') setEntry(data.data);
                else setError(data && data.error ? data.error : 'Failed to load entry');
            })
            .catch(err => {
                if (!mounted) return;
                setError(err.message || 'Failed to load entry');
            })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [id, user]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to permanently delete this journal entry? This action cannot be undone.')) return;
        try {
            const res = await fetch(`${API_BASE}/journal/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const json = await res.json();
            if (json.status === 'ok') {
                navigate('/journal');
            } else {
                alert(json.error || 'Failed to delete entry');
            }
        } catch (err) {
            alert('Network error');
        }
    };

    // Share capability removed per request

    const canDelete = entry && user && (user.id === entry.user_id || user.is_admin);
    const moodForEntry = entry?.mood || entry?.mood_label || 'indifferent';

    return (
        <>
            <ViewPostPageHeader />
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl ml-auto mr-8 px-4">
                    {loading && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                            <div className="animate-pulse space-y-4">
                                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-32 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    )}
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                            {error}
                        </div>
                    )}
                    
                    {entry && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            {/* Main Entry Card */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="px-4 pt-4 pb-3">
                                    <div className="flex gap-3">
                                        {/* Avatar with mood gradient */}
                                        <div className={`flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br ${moodGradients[moodForEntry] || moodGradients.indifferent} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                            {(entry.username || 'U')[0].toUpperCase()}
                                        </div>
                                        
                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-bold text-sm text-gray-900 truncate">
                                                            {entry.username || (user && user.id === entry.user_id ? (user.username || 'You') : `User ${entry.user_id || 'Unknown'}`)}
                                                        </span>
                                                        <span className="text-gray-400 text-xs">·</span>
                                                        <span className="text-gray-500 text-xs">{formatTimeSince(entry.created_at)}</span>
                                                    </div>
                                                    <span className={`inline-block mt-1.5 text-xs px-2.5 py-1 rounded-full font-semibold capitalize border ${moodColors[moodForEntry] || moodColors.indifferent}`}>
                                                        {moodForEntry}
                                                    </span>
                                                </div>
                                                {canDelete && (
                                                    <button
                                                        onClick={() => setShowActions(!showActions)}
                                                        className="flex-shrink-0 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                                                        aria-label="More options"
                                                    >
                                                        <MoreHorizontal size={16} className="text-gray-500" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Entry Title & Content */}
                                <div className="px-4 pb-4">
                                    <h1 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                                        {entry.title || `Entry ${entry.entry_id}`}
                                    </h1>
                                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {entry.content}
                                    </div>
                                </div>

                                {/* Privacy Indicator */}
                                <div className="px-4 py-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Eye size={14} />
                                        <span className="font-medium">Private Journal Entry</span>
                                    </div>
                                </div>

                                {/* Action buttons removed (share capability disabled) */}
                            </div>
                            
                            {/* More Actions Dropdown - positioned outside card */}
                            {showActions && canDelete && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-4 top-14 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[160px]"
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
                    )}
                </div>
            </div>
        </>
    );
}
