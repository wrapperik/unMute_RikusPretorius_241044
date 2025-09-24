import React, { useState, useEffect, useContext } from "react";
import { Send, Trash2, Flag as FlagIcon } from 'lucide-react'
import { AuthContext } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';

const CommentSection = ({ postId }) => {
    const { user } = useContext(AuthContext);
    const [comments, setComments] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);

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
        if (!confirm('Flag this comment for review?')) return;
        try {
            const res = await fetch(`${API_BASE}/posts/${postId}/comments/${commentId}/flag`, {
                method: 'POST',
                headers: {
                    ...(user && user.token ? { Authorization: `Bearer ${user.token}` } : {})
                }
            });
            const json = await res.json();
            if (res.ok && json.status === 'ok') {
                setComments(prev => prev.map(c => c.comment_id === commentId ? { ...c, is_flagged: 1, flagged_at: new Date().toISOString() } : c));
            } else {
                console.error('Failed to flag comment', json);
            }
        } catch (err) {
            console.error('Network error flagging comment', err);
        }
    };

    return (
        <div id="comment-section" className="max-w-7xl mx-auto mt-8 p-4 text-black">
            <h2 className="text-2xl font-bold mb-4">Comments</h2>
            {loading ? (
                <p>Loading comments...</p>
            ) : (
                <div className="space-y-4 mb-6">
                    {comments.length === 0 && <p className="text-gray-600">No comments yet.</p>}
                    {comments.map((comment) => (
                        <div key={comment.comment_id} className={`chat ${comment.user_id ? 'chat-start' : 'chat-start'}`}>
                            {/* <div className="chat-image avatar">
                                <div className="w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-700">{(comment.username || 'A').charAt(0)}</div>
                            </div> */}
                            <div className="chat-bubble rounded-2xl bg-white">
                                <div className="flex  items-start justify-between gap-4">
                                    <div>
                                        <span className="font-semibold mr-2">{comment.username || (comment.user_id ? 'User' : 'Anonymous')}</span>
                                        <span className="text-sm text-gray-700">{comment.content}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {user && user.id && Number(user.id) === Number(comment.user_id) && (
                                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(comment.comment_id)} aria-label="Delete comment"><Trash2 size={14} /></button>
                                        )}
                                        <button className="btn btn-ghost btn-sm" onClick={() => handleFlag(comment.comment_id)} aria-label="Flag comment"><FlagIcon size={14} /></button>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">{comment.created_at ? new Date(comment.created_at).toLocaleString() : ''} {comment.is_flagged ? ' • Flagged' : ''}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                    type="text"
                    className="input input-bordered rounded-full w-full"
                    placeholder="Add a comment..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" className="btn rounded-full bg-white">
                     <Send size={16} />
                    Post
                </button>
            </form>
        </div>
    );
};

export default CommentSection;