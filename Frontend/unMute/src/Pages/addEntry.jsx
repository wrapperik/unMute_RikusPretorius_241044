import React, { useState, useContext } from 'react'
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
            <div className="max-w-7xl mx-auto mt-8 p-6 rounded-xl text-black">
                <form className="flex flex-col gap-6 mx-5" onSubmit={handleSubmit}>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text mb-2 text-black">Title</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Entry title"
                            className="input input-bordered w-full rounded-full text-black"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label mb-2 text-black">
                            <span className="label-text">Mood</span>
                        </label>
                        <div className="flex gap-3 mt-2">
                                {[
                                  { key: 'excited', label: 'Excited' },
                                  { key: 'happy', label: 'Happy' },
                                  { key: 'indifferent', label: 'Indifferent' },
                                  { key: 'sad', label: 'Sad' },
                                  { key: 'frustrated', label: 'Frustrated' },
                                ].map(t => (
                                    <button
                                        type="button"
                                        key={t.key}
                                        className={`btn btn-sm rounded-full px-4 text-black border border-gray-300 bg-base-100 hover:bg-gray-200 focus:bg-gray-300 ${mood === t.key ? 'bg-gray-300 font-bold' : ''}`}
                                        onClick={() => setMood(t.key)}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                        </div>
                    </div>
                    <div className="form-control relative">
                        <label className="label">
                            <span className="label-text mb-2 text-black">Body</span>
                        </label>
                        <textarea
                            placeholder="Write your entry here..."
                            className="textarea textarea-bordered w-full min-h-[120px] text-black rounded-3xl"
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            maxLength={5000}
                            required
                        />
                        <span className="absolute right-2 bottom-2 text-xs text-black bg-white/80 px-2 py-1 rounded-full shadow">{wordCount} / 5000 words</span>
                    </div>
                    {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
                    {success && <div className="text-green-600 text-sm mt-2">Entry submitted successfully!</div>}
                </form>
            </div>
        </>
    )
}
