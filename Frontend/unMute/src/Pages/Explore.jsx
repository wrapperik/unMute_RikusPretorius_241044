import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Clock, Sparkles } from 'lucide-react';
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

// Skeleton loader component
function PostSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Explore() {
  // State for posts + UI state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for selected topic filter
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [isFiltering, setIsFiltering] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'top'
  
  const handleDeletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const handleLikesUpdate = (postId, newLikes) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, likes: newLikes } : post
      )
    );
  };

  const handleTopicChange = (topic) => {
    setIsFiltering(true);
    setSelectedTopic(topic);
    // Add a small delay to show the transition
    setTimeout(() => {
      setIsFiltering(false);
    }, 300);
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

        // Load likes for all posts
        Promise.all(
          mapped.map(post => 
            fetch(`${API_BASE}/posts/${post.id}/likes`)
              .then(res => res.json())
              .then(json => ({
                postId: post.id,
                likes: json.status === 'ok' && json.data ? json.data : { count: 0, liked_by_user: false }
              }))
              .catch(() => ({ postId: post.id, likes: { count: 0, liked_by_user: false } }))
          )
        ).then(likesData => {
          if (!mounted) return;
          setPosts(prevPosts => 
            prevPosts.map(post => {
              const postLikes = likesData.find(l => l.postId === post.id);
              return postLikes ? { ...post, likes: postLikes.likes } : post;
            })
          );
        });
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-72">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </aside>
            <section className="flex-1 max-w-2xl space-y-4">
              {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
            </section>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium">Error loading posts: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </main>
      </>
    );
  }

  // Topic color mapping
  const topicColors = {
    Joy: 'bg-yellow-50 border-2 border-yellow-200',
    Stress: 'bg-red-50 border-2 border-red-200',
    Anxiety: 'bg-blue-50 border-2 border-blue-200',
    Depression: 'bg-purple-50 border-2 border-purple-200',
    Motivation: 'bg-green-50 border-2 border-green-200',
    Other: 'bg-gray-50 border-2 border-gray-200',
  };

  // Get unique topics and their post counts
  const topics = posts.reduce((acc, post) => {
    const raw = (post.topic || 'Other').toString();
    const t = raw.trim().replace(/\s+/g, ' ');
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  // Filter and sort posts
  let filteredPosts = selectedTopic === 'All' ? posts : posts.filter(post => post.topic === selectedTopic);
  
  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.description.toLowerCase().includes(query) ||
      (post.username && post.username.toLowerCase().includes(query))
    );
  }

  // Sort posts
  if (sortBy === 'top') {
    filteredPosts = [...filteredPosts].sort((a, b) => (b.likes?.count || 0) - (a.likes?.count || 0));
  }
  // 'recent' is default order from API

  return (
    <>
      <PageHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Topics & Filters */}
        <aside className="w-full lg:w-80 lg:sticky lg:top-24 self-start" aria-label="Filter posts by topic">
          {/* Topics Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-[#004643]" />
              Topics
            </h2>
            
            {/* Mobile: Horizontal scroll */}
            <div className="lg:hidden">
              <ul className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide" role="list">
                <li className="flex-shrink-0">
                  <button
                    onClick={() => handleTopicChange('All')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedTopic === 'All' 
                        ? 'bg-[#004643] text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All <span className="ml-1 opacity-75">({posts.length})</span>
                  </button>
                </li>
                {Object.entries(topics).map(([topic, count]) => (
                  <li key={topic} className="flex-shrink-0">
                    <button
                      onClick={() => handleTopicChange(topic)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        selectedTopic === topic 
                          ? 'bg-[#004643] text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {topic} <span className="ml-1 opacity-75">({count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop: Vertical list */}
            <ul className="hidden lg:block space-y-2" role="list">
              <li>
                <button
                  onClick={() => handleTopicChange('All')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedTopic === 'All' 
                      ? 'bg-[#004643] text-white shadow-md' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>All Topics</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    selectedTopic === 'All' ? 'bg-white/20 text-white' : 'bg-[#004643] text-white'
                  }`}>{posts.length}</span>
                </button>
              </li>
              {Object.entries(topics).map(([topic, count]) => (
                <li key={topic}>
                  <button
                    onClick={() => handleTopicChange(topic)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      selectedTopic === topic 
                        ? 'bg-[#004643] text-white shadow-md' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{topic}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      selectedTopic === topic ? 'bg-white/20 text-white' : 'bg-[#004643] text-white'
                    }`}>{count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Trending Stats - Desktop Only */}
          <div className="hidden lg:block mt-4 bg-gradient-to-br from-[#004643] to-[#003832] rounded-2xl p-4 text-white shadow-lg">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <TrendingUp size={18} />
              Community Stats
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="opacity-90">Total Posts</span>
                <span className="font-bold text-lg">{posts.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Active Topics</span>
                <span className="font-bold text-lg">{Object.keys(topics).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Filtered Results</span>
                <span className="font-bold text-lg">{filteredPosts.length}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <section className="flex-1 max-w-2xl ml-auto w-full">
          {/* Sort Controls */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 mb-4 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setSortBy('recent')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  sortBy === 'recent' 
                    ? 'bg-[#004643] text-white' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Clock size={16} />
                Recent
              </button>
              <button
                onClick={() => setSortBy('top')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  sortBy === 'top' 
                    ? 'bg-[#004643] text-white' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Sparkles size={16} />
                Top Liked
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          {isFiltering ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-500 text-sm">
                {searchQuery ? `No results for "${searchQuery}"` : 'No posts match your filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, idx) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    transition={{ 
                      duration: 0.3,
                      delay: idx * 0.05,
                      layout: { duration: 0.3 }
                    }}
                  >
                    <PostCard post={post} onDelete={handleDeletePost} onLikesUpdate={handleLikesUpdate} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>
    </>
  );
}