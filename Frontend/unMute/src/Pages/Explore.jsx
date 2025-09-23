import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../Components/explorePageHeader.jsx'
import { Heart } from 'lucide-react'
import { MessageCircle } from 'lucide-react'
import { Flag } from 'lucide-react'


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

export default function Explore() {
  // State for posts + UI state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for selected topic filter
  const [selectedTopic, setSelectedTopic] = useState('All');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/posts/public`)
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

        // Map DB rows into the UI shape expected by the page using title/topic/created_at from DB
        const mapped = (json.data || []).map(r => {
          const content = r.content || '';
          const rawTopic = (r.topic || '').toString();
          const topic = (rawTopic && rawTopic !== 'NULL')
            ? rawTopic.trim().replace(/\s+/g, ' ')
            : 'Other';
          const createdAt = r.created_at ? new Date(r.created_at) : null;

          return {
            id: r.post_id,
            title: (r.title && r.title.trim()) || (content.split('\n')[0] || `Post ${r.post_id}`).slice(0, 255),
            username: r.username || null,
            topic,
            time: formatTimeSince(createdAt),
            description: content,
            raw: r,
          };
        });

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

  // Get unique topics and their post counts
  const topics = posts.reduce((acc, post) => {
    const raw = (post.topic || 'Other').toString();
    const t = raw.trim().replace(/\s+/g, ' ');
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Filter posts based on selected topic
  const filteredPosts = selectedTopic === 'All' ? posts : posts.filter(post => post.topic === selectedTopic);

  // PostCard component to handle individual post hover state
  const PostCard = ({ post }) => {
    const [showReactions, setShowReactions] = useState(false);
    const [timeoutId, setTimeoutId] = useState(null);
    const navigate = useNavigate();

    const handleMouseEnter = () => {
      if (timeoutId) clearTimeout(timeoutId);
      setShowReactions(true);
    };

    const handleMouseLeave = () => {
      const id = setTimeout(() => setShowReactions(false), 400);
      setTimeoutId(id);
    };

    useEffect(() => {
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    }, [timeoutId]);

    const handleClick = () => {
  navigate(`/viewpost/${post.id}`, { state: { postTitle: post.title } });
    };

    return (
      <div className="relative container" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className="card-body card bg-white card-md rounded-3xl text-black shadow-sm m-2 h-auto cursor-pointer" onClick={handleClick}>
          <div className="flex">
            <h2 className="card-title flex-start">
              {post.title}
              {post.username && (
                <span className="ml-3 text-sm text-black/50">by {post.username}</span>
              )}
            </h2>
            <div className="flex-end ml-auto flex items-center gap-2">
              <p>{post.time}</p>
              <h4 className="card-title text-sm px-2 rounded-full bg-[#DED5E6]">{post.topic}</h4>
            </div>
          </div>
          <div className="h-0.5 w-full rounded bg-black/10"></div>
          <p>{post.description}</p>
        </div>
        {/* Animated Reactions - show based on state */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-0 right-4 -bottom-3 flex justify-end gap-2 px-2 mt-10"
              style={{ pointerEvents: 'none' }}
            >
              <div className="rounded-full h-11 w-11 bg-white text-black items-center justify-center border border-0.5 border-gray-200 flex transform transition duration-200 ease-in-out hover:scale-[1.10] hover:shadow-md cursor-pointer" style={{ pointerEvents: 'auto' }}>
                <Flag size={16} />
              </div>
              <div className="rounded-full h-11 w-11 bg-white text-black items-center justify-center border border-0.5 border-gray-200 flex transform transition duration-200 ease-in-out hover:scale-[1.10] hover:shadow-md cursor-pointer" style={{ pointerEvents: 'auto' }}>
                <MessageCircle size={16} />
              </div>
              <div className="rounded-full h-11 w-11 bg-white text-black items-center justify-center flex border border-0.5 border-gray-200 transform transition duration-200 ease-in-out hover:scale-[1.10] hover:shadow-md cursor-pointer" style={{ pointerEvents: 'auto' }}>
                <Heart size={16} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <PageHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 flex flex-col lg:flex-row gap-12">
        {/* Filtering System */}
        <aside className="text-black w-full lg:w-1/3 lg:sticky top-28 self-start" aria-label="Filter posts by topic">
          <h1 className="text-xl font-bold">Browse by Topic</h1>
          <div className="text-black flex mt-5">
            <ul className="space-y-4 w-full" role="list">
              <li>
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedTopic === 'All'}
                  onClick={() => setSelectedTopic('All')}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedTopic('All')}
                  className="flex w-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-md"
                >
                  <h2 className="flex-start">All</h2>
                  <h2 className="ml-auto bg-[#E2EEDA] px-3 py-0.5 rounded-full">{posts.length}</h2>
                </div>
              </li>
              {Object.entries(topics).map(([topic, count]) => (
                <li key={topic}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedTopic === topic}
                    onClick={() => setSelectedTopic(topic)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedTopic(topic)}
                    className="flex w-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-md"
                  >
                    <h2 className="flex-start">{topic}</h2>
                    <h2 className="ml-auto bg-[#E2EEDA] px-3 py-0.5 rounded-full">{count}</h2>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Cards Section */}
        <section className="flex flex-col gap-8 w-full lg:w-2/3 " aria-live="polite" aria-label="Posts list">
          <AnimatePresence>
            {filteredPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 60, damping: 18, delay: idx * 0.08 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </main>
    </>
  );
}