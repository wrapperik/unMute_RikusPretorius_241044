import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ViewPostPageHeader from '../Components/viewPostPageHeader';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react'
import { Flag } from 'lucide-react'
import { AuthContext } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';

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
    const entryTitle = state && state.entryTitle;
    const [entry, setEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useContext(AuthContext);
    const [likes, setLikes] = useState({ count: 0, liked_by_user: false });

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

    return (
        <>
            <ViewPostPageHeader />
            <div className="container mx-auto p-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 ">
                {loading && <p>Loading entry...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {entry && (
                    <>
                        <h1 className="text-3xl text-black font-bold mb-2">{entry.title || `Entry ${entry.entry_id}`}</h1>
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-lg text-black">By {
                                entry.username ? entry.username
                                : (user && user.id === entry.user_id ? (user.username || 'You')
                                : (entry.user_id ? `User ${entry.user_id}` : 'Unknown'))
                            } | {formatTimeSince(entry.created_at)}</span>
                            <div className="flex items-center gap-2 ml-auto">
                                {/* Show delete button if the logged-in user owns the entry or is admin */}
                                {(user && (user.id === entry.user_id || user.is_admin)) && (
                                    <button
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (!window.confirm('Permanently delete this entry?')) return;
                                            try {
                                                const res = await fetch(`${API_BASE}/journal/${id}`, {
                                                    method: 'DELETE',
                                                    headers: { Authorization: `Bearer ${user.token}` }
                                                });
                                                const json = await res.json();
                                                if (json.status === 'ok') {
                                                    // navigate back to journal listing
                                                    window.location.href = '/journal';
                                                } else {
                                                    alert(json.error || 'Failed to delete entry');
                                                }
                                            } catch (err) {
                                                alert('Network error');
                                            }
                                        }}
                                        className="rounded-full h-11 w-11 bg-white text-red-600 items-center justify-center border border-0.5 border-gray-200 flex transform transition duration-200 ease-in-out hover:scale-[1.10] hover:shadow-md cursor-pointer"
                                        title="Delete entry"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-trash-2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"/></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="h-0.5 w-full rounded bg-black/10 mb-4"></div>
                        <div className="text-lg text-black">
                            {entry.content && entry.content.split('\n').map((line, idx) => (
                                <React.Fragment key={idx}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
