import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../Components/explorePageHeader.jsx'
import PostCard from '../Components/PostCard.jsx'
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

export default function Explore() {
  // State for posts + UI state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for selected topic filter
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [isFiltering, setIsFiltering] = useState(false);
  
  const handleDeletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const handleTopicChange = (topic) => {
    setIsFiltering(true);
    setSelectedTopic(topic);
    // Add a small delay to show the transition
    setTimeout(() => {
      setIsFiltering(false);
    }, 400);
  };

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
            likes: { count: 0, liked_by_user: false },
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

  // Topic color mapping
  const topicColors = {
    Joy: 'bg-white border-1 border-base-500',
    Stress: 'bg-white border-1  border-base-500',
    Anxiety: 'bg-white border-1 border-base-500',
    Depression: 'bg-white border-1 border-base-500',
    Motivation: 'bg-white border-1 border-base-500',
    Other: 'bg-white border-1  border-base-500',
  };

  // Get unique topics and their post counts
  const topics = posts.reduce((acc, post) => {
    const raw = (post.topic || 'Other').toString();
    const t = raw.trim().replace(/\s+/g, ' ');
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Filter posts based on selected topic
  const filteredPosts = selectedTopic === 'All' ? posts : posts.filter(post => post.topic === selectedTopic);

  // PostCard is now a shared component in ../Components/PostCard.jsx

  return (
    <>
      <PageHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 flex flex-col lg:flex-row gap-8">
        {/* Filtering System */}
        <aside className="text-black w-full lg:w-72 lg:sticky top-28 self-start rounded-2xl lg:rounded-2xl md:rounded-2xl" aria-label="Filter posts by topic">
          <h1 className="text-xl font-bold mb-4 flex items-center gap-2 hidden md:flex">
            Browse Topics
          </h1>
          <div className="text-black flex md:flex">
            <ul className="space-y-2 w-full md:space-y-2 flex md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 gap-2 md:gap-0" role="list">
              <li className="flex-shrink-0 md:flex-shrink">
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedTopic === 'All'}
                  onClick={() => handleTopicChange('All')}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTopicChange('All')}
                  className={`flex items-center whitespace-nowrap px-3 md:px-2 py-2 md:py-2 rounded-xl cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black text-sm md:text-sm ${
                    selectedTopic === 'All' 
                      ? 'bg-black text-white shadow-sm' 
                      : 'bg-white hover:bg-gray-100 border-2 border-gray-200 hover:border-black'
                  }`}
                >
                  <h2 className="font-medium text-xs md:text-sm">All</h2>
                  <h2 className={`ml-2 md:ml-auto px-1.5 md:px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedTopic === 'All' ? 'bg-white text-black' : 'bg-black text-white'
                  }`}>{posts.length}</h2>
                </div>
              </li>
              {Object.entries(topics).map(([topic, count]) => (
                <li key={topic} className="flex-shrink-0 md:flex-shrink">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedTopic === topic}
                    onClick={() => handleTopicChange(topic)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleTopicChange(topic)}
                    className={`flex items-center whitespace-nowrap px-3 md:px-2 py-2 md:py-2 rounded-xl cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black text-sm md:text-sm ${
                      selectedTopic === topic 
                        ? 'bg-black text-white shadow-sm' 
                        : 'bg-white hover:bg-gray-100 border-2 border-gray-200 hover:border-black'
                    }`}
                  >
                    <h2 className="font-medium text-xs md:text-sm">{topic}</h2>
                    <h2 className={`ml-2 md:ml-auto px-1.5 md:px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedTopic === topic ? 'bg-white text-black' : 'bg-black text-white'
                    }`}>{count}</h2>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Cards Section - Pinterest Masonry Layout */}
        <section 
          className="flex-1 masonry-grid" 
          aria-live="polite" 
          aria-label="Posts list"
        >
          {isFiltering ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {filteredPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ scale: 0.8, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 100, 
                    damping: 15, 
                    delay: idx * 0.03 
                  }}
                  style={{
                    breakInside: 'avoid',
                    marginBottom: '1.5rem',
                    display: 'inline-block',
                    width: '100%'
                  }}
                >
                  <PostCard post={post} onDelete={handleDeletePost} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </section>
      </main>
    </>
  );
}