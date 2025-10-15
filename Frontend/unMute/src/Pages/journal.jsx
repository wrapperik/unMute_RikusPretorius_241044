import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 flex flex-col lg:flex-row gap-12">
        <aside className="text-black w-full lg:w-1/3 lg:sticky top-28 self-start bg-white rounded-2xl" aria-label="Filter posts by mood">
          <h1 className="text-xl font-bold mb-4">Browse by Mood</h1>
          <div className="text-black flex">
            {/* Mood selector chips */}
            {(() => {
              // compute mood counts from journal posts
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

              return (
                <ul className="space-y-2 w-full" role="list">
                  {moodOptions.map(m => {
                    const count = m.key === 'All' ? posts.filter(p => p.__type === 'journal').length : (moodCounts[m.key] || 0);
                    const isActive = selectedMood === m.key || (selectedMood === 'All' && m.key === 'All');
                    return (
                      <li key={m.key}>
                        <div
                          role="button"
                          tabIndex={0}
                          aria-pressed={isActive}
                          onClick={() => setSelectedMood(m.key)}
                          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedMood(m.key)}
                          className={`flex w-50 p-2 rounded-xl cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black ${
                            isActive 
                              ? 'bg-black text-white shadow-sm' 
                              : 'bg-white hover:bg-gray-100 border-2 border-gray-200 hover:border-black'
                          }`}
                        >
                          <h2 className="flex-start font-medium text-sm">{m.label}</h2>
                          <h2 className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
                            isActive ? 'bg-white text-black' : 'bg-black text-white'
                          }`}>{count}</h2>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              );
            })()}
          </div>
        </aside>

        <section className="flex flex-col gap-8 w-full lg:w-2/3 " aria-live="polite" aria-label="Journal entries list">
          {loading && <p>Loading entries</p>}
          {error && <p className="text-red-600">Error: {error}</p>}
          {!loading && !error && (() => {
            // When a mood is selected, show only journal entries matching that mood
            const filtered = selectedMood === 'All' ? posts : posts.filter(p => p.__type === 'journal' && String(p.mood) === String(selectedMood));
            return filtered.map((post, idx) => (
            <motion.div key={post.__type === 'journal' ? `j-${post.entry_id}` : `p-${post.id}`} initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} transition={{ type: 'spring', stiffness: 60, damping: 18, delay: idx * 0.08 }}>
              {post.__type === 'journal' ? (
                <JournalEntryCard entry={post} onDelete={(id) => setPosts(prev => prev.filter(p => !(p.__type === 'journal' && p.entry_id === id)))} />
              ) : (
                <PostCard post={post} onDelete={handleDeletePost} />
              )}
            </motion.div>
            ));
          })()}
        </section>
      </main>
    </>
  );
}

