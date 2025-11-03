import React, { useState, useContext } from 'react'
import { motion } from 'framer-motion'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';
import AddEntryPageHeader from '../Components/addEntryPageHeader'
import { AuthContext } from '../context/AuthContext'

export default function AddEntryPage() {
    const [title, setTitle] = useState("");
    const [mood, setMood] = useState("");
    const [body, setBody] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
    const { user } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(false);
        try {
                // Client-side validation: all fields required
                if (!title || !mood || !body) {
                    throw new Error('Please fill in title, mood and body before saving.');
                }
            // Token is stored in AuthContext under `user.token` (or in localStorage 'user')
            const token = user?.token || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : null);
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // 1) Create the journal entry
            const res = await fetch(`${API_BASE}/journal`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ title, content: body })
            });
            const data = await res.json();
            if (!res.ok || data.status === 'error') {
                throw new Error(data.error || 'Failed to submit entry');
            }

            const entry = data.data;
            const entryId = entry && (entry.entry_id || entry.id || entry.entryId || null);

            // 2) Post a mood check-in for the created entry (best-effort)
            if (entryId && mood) {
                try {
                    const mres = await fetch(`${API_BASE}/moodcheckins`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ entry_id: entryId, mood })
                    });
                    const mdata = await mres.json();
                    if (!mres.ok || mdata.status === 'error') {
                        // don't fail the whole flow, but inform user
                        console.warn('Mood check-in failed', mdata);
                        setError('Entry saved but mood check-in failed');
                    }
                } catch (err) {
                    console.warn('Mood check-in request error', err);
                    setError('Entry saved but mood check-in request failed');
                }
            }

            setSuccess(true);
            setTitle("");
            setMood("");
            setBody("");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <AddEntryPageHeader onSave={handleSubmit} submitting={submitting} />
            <div className="max-w-4xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 pb-12">
                <motion.div 
                    className="bg-white rounded-3xl shadow-lg border-2 border-gray-100 p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
                        {/* Title Input */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-base font-semibold text-black">Title</span>
                                <span className="label-text-alt text-sm text-gray-500">Required</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Give your entry a title..."
                                className="input input-bordered w-full rounded-2xl text-black bg-gray-50 border-2 border-gray-200 focus:border-[#004643] focus:bg-white transition-all"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Mood Selection */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-base font-semibold text-black">How are you feeling?</span>
                                <span className="label-text-alt text-sm text-gray-500">Required</span>
                            </label>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {[
                                  { key: 'excited', label: 'Excited', emoji: '😊' },
                                  { key: 'happy', label: 'Happy', emoji: '😄' },
                                  { key: 'indifferent', label: 'Indifferent', emoji: '😐' },
                                  { key: 'sad', label: 'Sad', emoji: '😢' },
                                  { key: 'frustrated', label: 'Frustrated', emoji: '😤' },
                                ].map(t => (
                                    <button
                                        type="button"
                                        key={t.key}
                                        className={`btn btn-sm rounded-2xl px-6 py-2 border-2 transition-all duration-200 ${
                                            mood === t.key 
                                                ? 'bg-[#004643] text-white border-[#004643] shadow-md scale-105' 
                                                : 'bg-white text-black border-gray-300 hover:border-[#004643] hover:bg-gray-50'
                                        }`}
                                        onClick={() => setMood(t.key)}
                                    >
                                        <span className="mr-2">{t.emoji}</span>
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Body Textarea */}
                        <div className="form-control relative">
                            <label className="label">
                                <span className="label-text text-base font-semibold text-black">Write your thoughts</span>
                                <span className="label-text-alt text-sm text-gray-500">Required</span>
                            </label>
                            <textarea
                                placeholder="Write your journal entry here... Express yourself freely and honestly."
                                className="textarea textarea-bordered w-full min-h-[200px] text-black rounded-2xl bg-gray-50 border-2 border-gray-200 focus:border-[#004643] focus:bg-white transition-all resize-none"
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                maxLength={5000}
                                required
                            />
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-gray-500">Max 5000 words</span>
                                <span className="text-sm font-medium text-black bg-gray-100 px-3 py-1 rounded-full">
                                    {wordCount} words
                                </span>
                            </div>
                        </div>

                        {/* Privacy Notice */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <div>
                                    <h3 className="font-semibold text-black mb-1">Private & Secure</h3>
                                    <p className="text-sm text-gray-700">Your journal entries are private and only visible to you. They are stored securely and never shared with others.</p>
                                </div>
                            </div>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <motion.div 
                                className="alert alert-error bg-red-50 border-2 border-red-200 rounded-2xl"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-red-700 font-medium">{error}</span>
                            </motion.div>
                        )}
                        {success && (
                            <motion.div 
                                className="alert alert-success bg-green-50 border-2 border-green-200 rounded-2xl"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-green-700 font-medium">Entry saved successfully!</span>
                            </motion.div>
                        )}
                    </form>
                </motion.div>
            </div>
        </>
    )
}
