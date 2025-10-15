import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../Components/resourcesPageHeader.jsx'
import { Trash2, ExternalLink } from 'lucide-react'
import { AuthContext } from '../context/AuthContext.jsx'


const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';

function formatTimeSince(date) {
  if (!date) return '';
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

export default function ResourcesPage() {
  const { user } = useContext(AuthContext);
  // State for posts + UI state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for selected topic filter (unused for resources)
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!user || !(user.is_admin || user.isAdmin)) return;
    if (!confirm('Delete this resource permanently?')) return;
    try {
      setDeletingId(id);
      const res = await fetch(`${API_BASE}/resources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'ok') {
        throw new Error(data.error || 'Failed to delete');
      }
      setPosts(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/resources`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(json => {
        if (!mounted) return;
        if (json.status !== 'ok') {
          setError(json.error || 'Unexpected API response');
          return;
        }
        const mapped = (json.data || []).map(r => ({
          id: r.resource_id,
          title: r.title,
          url: r.url,
          description: r.description,
          created_at: r.created_at,
          raw: r,
        }));
        setPosts(mapped);
      })
      .catch(err => {
        console.error('Failed to load posts:', err);
        if (mounted) setError(err.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <>
  <PageHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <p>Loading posts…</p>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
  <PageHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <p className="text-red-600">Error loading posts: {error}</p>
        </main>
      </>
    );
  }

  // For resources we show all (no topics)
  const filteredPosts = posts;

  // PostCard component to handle individual post hover state
  const PostCard = ({ post, onDelete }) => {
  const { user } = useContext(AuthContext);
    const isAdmin = !!(user && (user.is_admin || user.isAdmin));
    const navigate = useNavigate();

    const handleClick = () => {
      // For resources, clicking opens URL if present
      if (post.url) {
        window.open(post.url, '_blank', 'noopener,noreferrer');
        return;
      }
    };

    return (
      <div className="relative container">
        <div className="card-body card bg-[#f7f7f7] card-md rounded-3xl text-black shadow-sm m-2 h-auto cursor-pointer" onClick={handleClick}>
          <div className="flex">
            <h2 className="card-title flex-start">{post.title}</h2>
            <div className="ml-auto text-sm text-black/50 flex items-center gap-2">
              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="btn btn-ghost btn-xs rounded-full text-black hover:bg-black/5"
                  title="Open resource"
                >
                  <ExternalLink size={16} />
                </a>
              )}
              <span>{post.created_at ? new Date(post.created_at).toLocaleString() : ''}</span>
              {isAdmin && (
                <button
                  className="btn btn-ghost btn-xs rounded-full text-red-600 hover:bg-red-50"
                  onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                  disabled={deletingId === post.id}
                  title="Delete resource"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="h-0.5 w-full rounded bg-black/10"></div>
          <p className="text-sm text-gray-800 line-clamp-4" style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <PageHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">

        {/* Resources List */}
        <section className="flex flex-col gap-8 w-full" aria-live="polite" aria-label="Resources list">
          <AnimatePresence>
            {filteredPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 60, damping: 18, delay: idx * 0.08 }}
              >
                <PostCard post={post} onDelete={handleDelete} />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </main>
    </>
  );
}