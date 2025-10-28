import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Type, Link as LinkIcon, FileText } from 'lucide-react'
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';
import AddPostPageHeader from '../Components/addPostPageHeader'
import { AuthContext } from '../context/AuthContext.jsx';


export default function AddResourcePage() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [title, setTitle] = useState("");
    const [url, setUrl] = useState("");
    const [body, setBody] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

        useEffect(() => {
            // only admins allowed; wait for AuthContext hydration
            // if user is explicitly non-admin, redirect; if null (loading), do nothing
            if (user && !(user.is_admin || user.isAdmin)) {
                navigate('/login');
            }
        }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(false);
        try {
            const res = await fetch(`${API_BASE}/resources`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
                body: JSON.stringify({
                    title,
                    url,
                    description: body,
                })
            });
            const data = await res.json();
            if (!res.ok || data.status === 'error') {
                throw new Error(data.error || 'Failed to submit resource');
            }
            setSuccess(true);
            setTitle("");
            setUrl("");
            setBody("");
            // optional: navigate back to resources after short delay
            setTimeout(() => navigate('/resources'), 600);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };
    return (
        <>
            <AddPostPageHeader onPost={handleSubmit} submitting={submitting} titleOverride="Add Resource" />
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
                                placeholder="Resource title..."
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#004643] focus:outline-none transition-colors text-black"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text text-gray-700 font-semibold mb-2">URL (optional)</span>
                        </label>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="url"
                                placeholder="https://example.com"
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#004643] focus:outline-none transition-colors text-black"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-control relative">
                        <label className="label">
                            <span className="label-text text-gray-700 font-semibold mb-2">Description</span>
                        </label>
                        <textarea
                            placeholder="Describe the resource..."
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-[#004643] focus:outline-none transition-colors text-black min-h-[200px]"
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            maxLength={20000}
                            required
                        />
                    </div>
                    {error && <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>}
                    {success && <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">Resource submitted successfully!</div>}
                </form>
            </div>
        </>
    )
}
