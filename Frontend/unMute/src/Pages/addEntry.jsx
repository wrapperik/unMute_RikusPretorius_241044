import React, { useState, useContext } from 'react'
import { Type, Smile, FileText } from 'lucide-react'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';
import AddEntryPageHeader from '../Components/addEntryPageHeader'
import { AuthContext } from '../context/AuthContext'

const moodColors = {
  excited: 'bg-green-50 border-2 border-green-200 text-green-800 hover:bg-green-100',
  happy: 'bg-yellow-50 border-2 border-yellow-200 text-yellow-800 hover:bg-yellow-100',
  indifferent: 'bg-gray-50 border-2 border-gray-200 text-gray-800 hover:bg-gray-100',
  sad: 'bg-blue-50 border-2 border-blue-200 text-blue-800 hover:bg-blue-100',
  frustrated: 'bg-red-50 border-2 border-red-200 text-red-800 hover:bg-red-100',
};

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
            <div className="max-w-3xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
                <form className="flex flex-col gap-6 bg-white rounded-3xl shadow-md p-8" onSubmit={handleSubmit}>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-gray-700 font-semibold mb-2">Title</span>
                        </label>
                        <div className="relative">
                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Give your entry a title..."
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#004643] focus:outline-none transition-colors text-black"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-gray-700 font-semibold mb-2">Mood</span>
                        </label>
                        <div className="flex flex-wrap gap-2 mt-2">
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
                                        className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                                          mood === t.key
                                            ? moodColors[t.key]
                                            : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#004643]'
                                        }`}
                                        onClick={() => setMood(t.key)}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                        </div>
                    </div>
                    <div className="form-control relative">
                        <label className="label">
                            <span className="label-text text-gray-700 font-semibold mb-2">Body</span>
                        </label>
                        <textarea
                            placeholder="Write your thoughts..."
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#004643] focus:outline-none transition-colors text-black min-h-[200px]"
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            maxLength={5000}
                            required
                        />
                        <span className="absolute right-3 bottom-3 text-xs text-gray-500 bg-white px-2 py-1 rounded-full">{wordCount} / 5000 words</span>
                    </div>
                    {error && <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
                    {success && <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">Entry submitted successfully!</div>}
                </form>
            </div>
        </>
    )
}
