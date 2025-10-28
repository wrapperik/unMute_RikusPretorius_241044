import React, { useState } from 'react'
import { Type, Hash, FileText } from 'lucide-react'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';
import AddPostPageHeader from '../Components/addPostPageHeader'

const topicColors = {
  Joy: 'bg-yellow-50 border-2 border-yellow-200 text-yellow-800 hover:bg-yellow-100',
  Stress: 'bg-red-50 border-2 border-red-200 text-red-800 hover:bg-red-100',
  Anxiety: 'bg-blue-50 border-2 border-blue-200 text-blue-800 hover:bg-blue-100',
  Depression: 'bg-purple-50 border-2 border-purple-200 text-purple-800 hover:bg-purple-100',
  Motivation: 'bg-green-50 border-2 border-green-200 text-green-800 hover:bg-green-100',
  Other: 'bg-gray-50 border-2 border-gray-200 text-gray-800 hover:bg-gray-100',
};

export default function AddPostPage() {
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
                headers: { 'Content-Type': 'application/json' },
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
            <div className="max-w-3xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
                <form className="flex flex-col gap-6 bg-white rounded-3xl shadow-md p-8" onSubmit={e => e.preventDefault()}>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-gray-700 font-semibold mb-2">Title</span>
                        </label>
                        <div className="relative">
                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Give your post a title..."
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#004643] focus:outline-none transition-colors text-black"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-gray-700 font-semibold mb-2">Topic</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {['Joy', 'Stress', 'Anxiety', 'Depression', 'Motivation','Other'].map(t => (
                                <button
                                    type="button"
                                    key={t}
                                    className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                                      topic === t 
                                        ? topicColors[t]
                                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#004643]'
                                    }`}
                                    onClick={() => setTopic(t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="form-control relative">
                        <label className="label">
                            <span className="label-text text-gray-700 font-semibold mb-2">Body</span>
                        </label>
                        <textarea
                            placeholder="Share your thoughts..."
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#004643] focus:outline-none transition-colors text-black min-h-[200px]"
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            maxLength={5000}
                            required
                        />
                        <span className="absolute right-3 bottom-3 text-xs text-gray-500 bg-white px-2 py-1 rounded-full">{wordCount} / 5000 words</span>
                    </div>
                    <div className="form-control flex-row items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <input
                            type="checkbox"
                            id="anonymous"
                            className="checkbox checkbox-sm border-2 border-gray-300 [--chkbg:#004643] [--chkfg:white]"
                            checked={isAnonymous}
                            onChange={e => setIsAnonymous(e.target.checked)}
                        />
                        <label htmlFor="anonymous" className="label-text text-gray-700 cursor-pointer">Post anonymously</label>
                    </div>
                    {error && <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
                    {success && <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">Post submitted successfully!</div>}
                </form>
            </div>
        </>
    )
}