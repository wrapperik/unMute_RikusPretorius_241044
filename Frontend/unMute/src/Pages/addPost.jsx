import React, { useState } from 'react'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';
import AddPostPageHeader from '../Components/addPostPageHeader'


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
            <div className="max-w-7xl mx-auto mt-8 p-6 rounded-xl text-black">
                <form className="flex flex-col gap-6 mx-5" onSubmit={e => e.preventDefault()}>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text mb-2 text-black">Title</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Post title"
                            className="input input-bordered w-full rounded-full text-black"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label mb-2 text-black">
                            <span className="label-text">Topic</span>
                        </label>
                        <div className="flex gap-3 mt-2">
                            {['Joy', 'Stress', 'Anxiety', 'Depression', 'Motivation','Other'].map(t => (
                                <button
                                    type="button"
                                    key={t}
                                    className={`btn btn-sm rounded-full px-4 text-black border border-gray-300 bg-base-100 hover:bg-gray-200 focus:bg-gray-300 ${topic === t ? 'bg-gray-300 font-bold' : ''}`}
                                    onClick={() => setTopic(t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="form-control relative">
                        <label className="label">
                            <span className="label-text mb-2 text-black">Body</span>
                        </label>
                        <textarea
                            placeholder="Write your post here..."
                            className="textarea textarea-bordered w-full min-h-[120px] text-black rounded-3xl"
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            maxLength={5000}
                            required
                        />
                        <span className="absolute right-2 bottom-2 text-xs text-black bg-white/80 px-2 py-1 rounded-full shadow">{wordCount} / 5000 words</span>
                    </div>
                    <div className="form-control flex-row items-center gap-2">
                        <input
                            type="checkbox"
                            id="anonymous"
                            className="checkbox"
                            checked={isAnonymous}
                            onChange={e => setIsAnonymous(e.target.checked)}
                        />
                        <label htmlFor="anonymous" className="label-text mx-2">Post anonymously</label>
                    </div>
                    {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
                    {success && <div className="text-green-600 text-sm mt-2">Post submitted successfully!</div>}
                </form>
            </div>
        </>
    )
}