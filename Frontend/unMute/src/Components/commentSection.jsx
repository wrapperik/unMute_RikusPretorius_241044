import React, { useState, useEffect, useContext, useRef } from "react";
import { Send, Trash2, Flag as FlagIcon, XCircle, AlertTriangle, MoreHorizontal } from 'lucide-react'
import { AuthContext } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';

const CommentSection = ({ postId }) => {
    const { user } = useContext(AuthContext);
    const [comments, setComments] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState(null);
    const isAdmin = user && (user.is_admin || user.isAdmin);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function loadComments() {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
            const json = await res.json();
            if (res.ok && json.status === 'ok') {
                setComments(json.data);
            } else if (res.ok && Array.isArray(json)) {
                // in case backend returns array directly
                setComments(json);
            }
        } catch (err) {
            console.error('Failed to load comments', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!postId) return;
        loadComments();
    }, [postId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        try {
            const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(user && user.token ? { Authorization: `Bearer ${user.token}` } : {})
                },
                body: JSON.stringify({ content: input.trim() })
            });
            const json = await res.json();
            if (res.status === 201 && json.status === 'ok' && json.data) {
                setComments(prev => [...prev, json.data]);
                setInput('');
            } else {
                console.error('Failed to post comment', json);
            }
        } catch (err) {
            console.error('Network error posting comment', err);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm('Delete this comment?')) return;
        try {
            const res = await fetch(`${API_BASE}/posts/${postId}/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    ...(user && user.token ? { Authorization: `Bearer ${user.token}` } : {})
                }
            });
            const json = await res.json();
            if (res.ok && json.status === 'ok') {
                setComments(prev => prev.filter(c => c.comment_id !== commentId));
            } else {
                console.error('Failed to delete comment', json);
            }
        } catch (err) {
            console.error('Network error deleting comment', err);
        }
    };

    const handleFlag = async (commentId) => {
        if (!user || !user.token) {
            alert('Please login to flag comments');
            return;
        }
        if (!confirm('Flag this comment for review?')) return;
        try {
            const res = await fetch(`${API_BASE}/posts/${postId}/comments/${commentId}/flag`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });
            const json = await res.json();
            if (res.ok && json.status === 'ok') {
                setComments(prev => prev.map(c => c.comment_id === commentId ? { ...c, is_flagged: 1, flagged_at: new Date().toISOString() } : c));
                alert('Comment flagged for review');
            } else {
                alert(json.error || 'Failed to flag comment');
            }
        } catch (err) {
            console.error('Network error flagging comment', err);
            alert('Network error');
        }
    };

    const handleAdminDeleteComment = async (commentId) => {
        if (!confirm('Delete this comment permanently?')) return;
        try {
            const res = await fetch(`${API_BASE}/admin/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const json = await res.json();
            if (res.ok && json.status === 'ok') {
                setComments(prev => prev.filter(c => c.comment_id !== commentId));
                alert('Comment deleted successfully');
            } else {
                alert(json.error || 'Failed to delete comment');
            }
        } catch (err) {
            alert('Network error');
        }
    };

    const handleDismissCommentFlag = async (commentId) => {
        if (!confirm('Remove flag from this comment?')) return;
        try {
            const res = await fetch(`${API_BASE}/admin/comments/${commentId}/unflag`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${user.token}` }
            });
            const json = await res.json();
            if (res.ok && json.status === 'ok') {
                setComments(prev => prev.map(c => c.comment_id === commentId ? { ...c, is_flagged: 0, flagged_at: null } : c));
                alert('Flag dismissed');
            } else {
                alert(json.error || 'Failed to dismiss flag');
            }
        } catch (err) {
            alert('Network error');
        }
    };

    const formatCommentDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return `${months[date.getMonth()]} ${date.getDate()}, ${hour12}:${minutes} ${ampm}`;
    };

    return (
        <div id="comment-section" className="text-black h-full">
            <div className="sticky top-8">
                <h2 className="text-xl font-bold mb-4">Comments</h2>
                {loading ? (
                    <p className="text-gray-600">Loading comments...</p>
                ) : (
                    <>
                        <div className="space-y-3 mb-4 max-h-[60vh] overflow-y-auto pr-2">
                            {comments.length === 0 && <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>}
                            {comments.map((comment) => (
                                <div key={comment.comment_id} className={`rounded-2xl p-4 shadow-sm border ${comment.is_flagged && isAdmin ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'}`}>
                                    <div className="flex items-start gap-3">
                                        {comment.profile_picture ? (
                                            <img 
                                                src={`/${comment.profile_picture}`} 
                                                alt={`${comment.username || 'User'}'s avatar`}
                                                className="flex-shrink-0 w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-800 via-green-750 to-green-900 flex items-center justify-center text-white font-bold text-sm">
                                                {(comment.username || 'A').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-sm text-gray-900">
                                                    {comment.username || (comment.user_id ? 'User' : 'Anonymous')}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {isAdmin ? (
                                                        <button 
                                                            className="p-1 hover:bg-red-50 rounded-lg transition-colors" 
                                                            onClick={() => handleAdminDeleteComment(comment.comment_id)} 
                                                            aria-label="Delete comment (admin)"
                                                            title="Delete comment (admin)"
                                                        >
                                                            <Trash2 size={14} className="text-red-600" />
                                                        </button>
                                                    ) : user && user.id && Number(user.id) === Number(comment.user_id) ? (
                                                        <button 
                                                            className="p-1 hover:bg-red-50 rounded-lg transition-colors" 
                                                            onClick={() => handleDelete(comment.comment_id)} 
                                                            aria-label="Delete comment"
                                                            title="Delete comment"
                                                        >
                                                            <Trash2 size={14} className="text-red-600" />
                                                        </button>
                                                    ) : (
                                                        <div className="relative" ref={openMenuId === comment.comment_id ? menuRef : null}>
                                                            <button 
                                                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors" 
                                                                onClick={() => setOpenMenuId(openMenuId === comment.comment_id ? null : comment.comment_id)}
                                                                aria-label="More options"
                                                                title="More options"
                                                            >
                                                                <MoreHorizontal size={14} className="text-gray-600" />
                                                            </button>
                                                            
                                                            {openMenuId === comment.comment_id && (
                                                                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                                                    <button 
                                                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                                                                        onClick={() => {
                                                                            handleFlag(comment.comment_id);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                    >
                                                                        <FlagIcon size={14} className="text-gray-600" />
                                                                        Flag
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 break-words">{comment.content}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-gray-500">
                                                    {formatCommentDate(comment.created_at)}
                                                </span>
                                                {!!comment.is_flagged && (
                                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium flex items-center gap-1">
                                                        <AlertTriangle size={10} />
                                                        Flagged
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Admin Controls for Flagged Comments */}
                                            {isAdmin && !!comment.is_flagged && (
                                                <div className="mt-3 pt-3 border-t border-red-200 flex gap-2">
                                                    <button
                                                        onClick={() => handleDismissCommentFlag(comment.comment_id)}
                                                        className="px-2 py-1 bg-gray-600 text-white rounded-lg text-xs hover:bg-gray-700 transition-colors flex items-center gap-1"
                                                    >
                                                        <XCircle size={12} />
                                                        Dismiss Flag
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleAddComment} className="mt-4">
                            <div className="flex flex-col gap-2">
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none text-sm"
                                    placeholder="Add a comment..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    rows="3"
                                />
                                <button 
                                    type="submit" 
                                    className="self-end px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium"
                                >
                                    <Send size={16} />
                                    Post Comment
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default CommentSection;