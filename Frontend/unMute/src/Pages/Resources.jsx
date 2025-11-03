import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../Components/resourcesPageHeader.jsx'
import { Trash2, ExternalLink, BookOpen } from 'lucide-react'
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
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004643]"></div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-medium">Error loading resources: {error}</p>
          </div>
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
      <motion.div 
        className="bg-white rounded-2xl shadow-md border-2 border-gray-100 hover:shadow-xl hover:border-[#004643] transition-all duration-300 cursor-pointer overflow-hidden group"
        onClick={handleClick}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-[#004643]/10 p-2 rounded-xl group-hover:bg-[#004643] transition-colors">
                <BookOpen className="w-5 h-5 text-[#004643] group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-black group-hover:text-[#004643] transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {post.created_at ? formatTimeSince(new Date(post.created_at)) + ' ago' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {post.url && (
                <button
                  onClick={(e) => { e.stopPropagation(); window.open(post.url, '_blank'); }}
                  className="btn btn-ghost btn-sm rounded-xl text-[#004643] hover:bg-[#004643] hover:text-white transition-all"
                  title="Open resource"
                >
                  <ExternalLink size={18} />
                </button>
              )}
              {isAdmin && (
                <button
                  className="btn btn-ghost btn-sm rounded-xl text-red-600 hover:bg-red-50 transition-all"
                  onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
                  disabled={deletingId === post.id}
                  title="Delete resource"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>

          {/* Description */}
          <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
            {post.description}
          </p>

          {/* URL Preview */}
          {post.url && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500 group-hover:text-[#004643] transition-colors">
                <ExternalLink size={12} />
                <span className="truncate">{new URL(post.url).hostname}</span>
              </div>
            </div>
          )}
        </div>

        {/* Hover Effect Border */}
        <div className="h-1 bg-gradient-to-r from-[#004643] to-[#00857a] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      </motion.div>
    );
  };

  return (
    <>
      <PageHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        
        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No resources yet</h3>
            <p className="text-gray-500">Check back soon for helpful mental health resources</p>
          </div>
        )}

        {/* Resources Grid */}
        <section 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          aria-live="polite" 
          aria-label="Resources list"
        >
          <AnimatePresence>
            {filteredPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: -20 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 100, 
                  damping: 15, 
                  delay: idx * 0.05 
                }}
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