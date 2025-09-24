import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
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
            <div className="max-w-7xl mx-auto mt-8 p-6 rounded-xl text-black">
                <form className="flex flex-col gap-6 mx-5" onSubmit={e => e.preventDefault()}>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text mb-2 text-black">Title</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Resource title"
                            className="input input-bordered w-full rounded-full text-black"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text mb-2 text-black">URL (optional)</span>
                        </label>
                        <input
                            type="url"
                            placeholder="https://example.com"
                            className="input input-bordered w-full rounded-full text-black"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                        />
                    </div>
                    <div className="form-control relative">
                        <label className="label">
                            <span className="label-text mb-2 text-black">Description</span>
                        </label>
                        <textarea
                            placeholder="Describe the resource..."
                            className="textarea textarea-bordered w-full min-h-[120px] text-black rounded-3xl"
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            maxLength={20000}
                            required
                        />
                    </div>
                    {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
                    {success && <div className="text-green-600 text-sm mt-2">Resource submitted successfully!</div>}
                </form>
            </div>
        </>
    )
}
