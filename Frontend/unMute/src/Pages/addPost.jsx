import React, { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { motion } from 'framer-motion'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';
import AddPostPageHeader from '../Components/addPostPageHeader'


export default function AddPostPage() {
    const { user } = useContext(AuthContext);
    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("");
    const [body, setBody] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(false);
        try {
            const res = await fetch(`${API_BASE}/posts`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    title,
                    topic,
                    content: body,
                    is_anonymous: isAnonymous ? 1 : 0,
                })
            });
            const data = await res.json();
            if (!res.ok || data.status === 'error') {
                throw new Error(data.error || 'Failed to submit post');
            }
            setSuccess(true);
            setTitle("");
            setTopic("");
            setBody("");
            setIsAnonymous(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <>
            <AddPostPageHeader onPost={handleSubmit} submitting={submitting} />
            <div className="max-w-4xl mx-auto mt-8 px-4 sm:px-6 lg:px-8 pb-12">
                <motion.div 
                    className="bg-white rounded-3xl shadow-lg border-2 border-gray-100 p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <form className="flex flex-col gap-8" onSubmit={e => e.preventDefault()}>
                        {/* Title Input */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-base font-semibold text-black">Title</span>
                                <span className="label-text-alt text-sm text-gray-500">Required</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Give your post a title..."
                                className="input input-bordered w-full rounded-2xl text-black bg-gray-50 border-2 border-gray-200 focus:border-[#004643] focus:bg-white transition-all"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Topic Selection */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-base font-semibold text-black">Topic</span>
                                <span className="label-text-alt text-sm text-gray-500">Required</span>
                            </label>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {['Joy', 'Stress', 'Anxiety', 'Depression', 'Motivation', 'Other'].map(t => (
                                    <button
                                        type="button"
                                        key={t}
                                        className={`btn btn-sm rounded-2xl px-6 py-2 border-2 transition-all duration-200 ${
                                            topic === t 
                                                ? 'bg-[#004643] text-white border-[#004643] shadow-md scale-105' 
                                                : 'bg-white text-black border-gray-300 hover:border-[#004643] hover:bg-gray-50'
                                        }`}
                                        onClick={() => setTopic(t)}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Body Textarea */}
                        <div className="form-control relative">
                            <label className="label">
                                <span className="label-text text-base font-semibold text-black">Share your thoughts</span>
                                <span className="label-text-alt text-sm text-gray-500">Required</span>
                            </label>
                            <textarea
                                placeholder="Write your post here... Share your story, thoughts, or experiences."
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

                        {/* Anonymous Checkbox */}
                        <div className="form-control">
                            <label className="flex items-center gap-3 cursor-pointer bg-gray-50 p-4 rounded-2xl border-2 border-gray-200 hover:border-[#004643] transition-all">
                                <input
                                    type="checkbox"
                                    id="anonymous"
                                    className="checkbox checkbox-lg border-2 border-gray-400 [--chkbg:#004643] [--chkfg:white]"
                                    checked={isAnonymous}
                                    onChange={e => setIsAnonymous(e.target.checked)}
                                />
                                <div className="flex-1">
                                    <span className="label-text text-base font-semibold text-black">Post anonymously</span>
                                    <p className="text-sm text-gray-600 mt-1">Your identity will be hidden from other users</p>
                                </div>
                            </label>
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
                                <span className="text-green-700 font-medium">Post submitted successfully!</span>
                            </motion.div>
                        )}
                    </form>
                </motion.div>
            </div>
        </>
    )
}