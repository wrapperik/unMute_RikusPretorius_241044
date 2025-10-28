import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, BookOpen } from 'lucide-react';
import JournalPageHeader from '../Components/journalPageHeader'
import PostCard from '../Components/PostCard.jsx'
import JournalEntryCard from '../Components/JournalEntryCard.jsx'
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

// Skeleton loader
function EntrySkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export default function JournalPage() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedMood, setSelectedMood] = React.useState('All');

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    // Try /journal first, then /posts/public as a fallback. Guard against HTML responses (which break JSON.parse).
    (async () => {
      try {
        const tryUrls = [`${API_BASE}/journal`, `${API_BASE}/posts/public`];
        let json = null;
        for (const url of tryUrls) {
          try {
            const res = await fetch(url);
            const ct = res.headers.get('content-type') || '';
            if (!ct.includes('application/json')) {
              // not JSON, try next
              continue;
            }
            json = await res.json();
            break;
          } catch (innerErr) {
            // if this attempt failed, continue to next
            continue;
          }
        }

        if (!mounted) return;
        if (!json) { setError('No JSON response from API'); return; }
        if (json.status !== 'ok') { setError(json.error || 'Unexpected API response'); return; }

        // Map API entries to unified format, then filter by logged-in user (if present)
        const mappedAll = (json.data || []).map(r => {
          if (r.entry_id) {
            return {
              __type: 'journal',
              entry_id: r.entry_id,
              user_id: r.user_id,
              title: r.title,
              content: r.content,
              mood: r.mood || null,
              created_at: r.created_at,
            };
          }

          const content = r.content || '';
          const rawTopic = (r.topic || '').toString();
          const topic = (rawTopic && rawTopic !== 'NULL') ? rawTopic.trim().replace(/\s+/g, ' ') : 'Other';
          const createdAt = r.created_at ? new Date(r.created_at) : null;

          return {
            __type: 'post',
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

        // If user is logged in, filter journal entries to only those created by them
        let mapped = mappedAll;
        if (user && user.id) {
          mapped = mappedAll.filter(m => !(m.__type === 'journal') || (m.__type === 'journal' && String(m.user_id) === String(user.id)));
        } else {
          // If not logged in, remove all journal-type entries (private to users)
          mapped = mappedAll.filter(m => m.__type !== 'journal');
        }

        setPosts(mapped);
      } catch (err) {
        if (mounted) setError(err.message || 'Fetch error');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  return (
    <>
      <JournalPageHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Mood Filters */}
        <aside className="w-full lg:w-80 lg:sticky lg:top-24 self-start" aria-label="Filter entries by mood">
          {/* Mood Filters Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-[#004643]" />
              Moods
            </h2>
            
            {/* Mobile: Horizontal scroll */}
            <div className="lg:hidden">
              <ul className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide" role="list">
                {(() => {
                  const moodCounts = posts.reduce((acc, p) => {
                    if (p.__type === 'journal') {
                      const key = p.mood || 'none';
                      acc[key] = (acc[key] || 0) + 1;
                    }
                    return acc;
                  }, {});

                  const moodOptions = [
                    { key: 'All', label: 'All' },
                    { key: 'excited', label: 'Excited' },
                    { key: 'happy', label: 'Happy' },
                    { key: 'indifferent', label: 'Indifferent' },
                    { key: 'sad', label: 'Sad' },
                    { key: 'frustrated', label: 'Frustrated' },
                  ];

                  return moodOptions.map(m => {
                    const count = m.key === 'All' ? posts.filter(p => p.__type === 'journal').length : (moodCounts[m.key] || 0);
                    const isActive = selectedMood === m.key;
                    return (
                      <li key={m.key} className="flex-shrink-0">
                        <button
                          onClick={() => setSelectedMood(m.key)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                            isActive 
                              ? 'bg-[#004643] text-white shadow-md' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {m.label} <span className="ml-1 opacity-75">({count})</span>
                        </button>
                      </li>
                    );
                  });
                })()}
              </ul>
            </div>

            {/* Desktop: Vertical list */}
            <ul className="hidden lg:block space-y-2" role="list">
              {(() => {
                const moodCounts = posts.reduce((acc, p) => {
                  if (p.__type === 'journal') {
                    const key = p.mood || 'none';
                    acc[key] = (acc[key] || 0) + 1;
                  }
                  return acc;
                }, {});

                const moodOptions = [
                  { key: 'All', label: 'All Moods' },
                  { key: 'excited', label: 'Excited' },
                  { key: 'happy', label: 'Happy' },
                  { key: 'indifferent', label: 'Indifferent' },
                  { key: 'sad', label: 'Sad' },
                  { key: 'frustrated', label: 'Frustrated' },
                ];

                return moodOptions.map(m => {
                  const count = m.key === 'All' ? posts.filter(p => p.__type === 'journal').length : (moodCounts[m.key] || 0);
                  const isActive = selectedMood === m.key;
                  return (
                    <li key={m.key}>
                      <button
                        onClick={() => setSelectedMood(m.key)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive 
                            ? 'bg-[#004643] text-white shadow-md' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span>{m.label}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[#004643] text-white'
                        }`}>{count}</span>
                      </button>
                    </li>
                  );
                });
              })()}
            </ul>
          </div>

          {/* Stats Card - Desktop Only */}
          <div className="hidden lg:block mt-4 bg-gradient-to-br from-[#004643] to-[#003832] rounded-2xl p-4 text-white shadow-lg">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Sparkles size={18} />
              Journal Stats
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="opacity-90">Total Entries</span>
                <span className="font-bold text-lg">{posts.filter(p => p.__type === 'journal').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="opacity-90">Filtered</span>
                <span className="font-bold text-lg">
                  {selectedMood === 'All' 
                    ? posts.filter(p => p.__type === 'journal').length 
                    : posts.filter(p => p.__type === 'journal' && String(p.mood) === String(selectedMood)).length
                  }
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <section className="flex-1 max-w-2xl ml-auto w-full" aria-live="polite" aria-label="Journal entries list">
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <EntrySkeleton key={i} />)}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-600 font-medium">Error: {error}</p>
            </div>
          )}
          
          {!loading && !error && (() => {
            const filtered = selectedMood === 'All' ? posts : posts.filter(p => p.__type === 'journal' && String(p.mood) === String(selectedMood));
            
            if (filtered.length === 0) {
              return (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No entries found</h3>
                  <p className="text-gray-500 text-sm">
                    {selectedMood === 'All' ? 'Start writing to create your first entry!' : `No entries with "${selectedMood}" mood`}
                  </p>
                </div>
              );
            }
            
            return (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filtered.map((post, idx) => (
                    <motion.div 
                      key={post.__type === 'journal' ? `j-${post.entry_id}` : `p-${post.id}`}
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
                      {post.__type === 'journal' ? (
                        <JournalEntryCard entry={post} onDelete={(id) => setPosts(prev => prev.filter(p => !(p.__type === 'journal' && p.entry_id === id)))} />
                      ) : (
                        <PostCard post={post} onDelete={handleDeletePost} />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            );
          })()}
        </section>
      </main>
    </>
  );
}