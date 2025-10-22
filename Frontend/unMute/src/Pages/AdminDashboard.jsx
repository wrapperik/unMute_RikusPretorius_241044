import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Flag, X, XCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext.jsx';
import PageHeader from '../Components/adminPageHeader.jsx';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';

function formatTimeSince(date) {
  if (!date) return '';
  const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
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

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Check admin access
  useEffect(() => {
    if (!user || !(user.is_admin || user.isAdmin)) {
      navigate('/');
    }
  }, [user, navigate]);

  // Sidebar state
  const [activeSection, setActiveSection] = useState('flaggedPosts');
  
  // Data states
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [flaggedComments, setFlaggedComments] = useState([]);
  const [resources, setResources] = useState([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Fetch flagged posts
  const fetchFlaggedPosts = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/flagged-posts`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setFlaggedPosts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch flagged posts:', err);
    }
  };

  // Fetch flagged comments
  const fetchFlaggedComments = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/flagged-comments`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setFlaggedComments(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch flagged comments:', err);
    }
  };

  // Fetch resources
  const fetchResources = async () => {
    try {
      const res = await fetch(`${API_BASE}/resources`);
      const data = await res.json();
      if (data.status === 'ok') {
        setResources(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch resources:', err);
    }
  };

  // Initial load
  useEffect(() => {
    if (user && (user.is_admin || user.isAdmin)) {
      Promise.all([
        fetchFlaggedPosts(),
        fetchFlaggedComments(),
        fetchResources()
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  // Delete flagged post
  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      setProcessingId(postId);
      const res = await fetch(`${API_BASE}/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setFlaggedPosts(prev => prev.filter(p => p.post_id !== postId));
      } else {
        throw new Error(data.error || 'Failed to delete post');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Dismiss flag from post
  const handleDismissPostFlag = async (postId) => {
    if (!confirm('Remove flag from this post?')) return;
    try {
      setProcessingId(postId);
      const res = await fetch(`${API_BASE}/admin/posts/${postId}/unflag`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setFlaggedPosts(prev => prev.filter(p => p.post_id !== postId));
      } else {
        throw new Error(data.error || 'Failed to dismiss flag');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Delete flagged comment
  const handleDeleteComment = async (commentId) => {
    if (!confirm('Delete this comment permanently?')) return;
    try {
      setProcessingId(commentId);
      const res = await fetch(`${API_BASE}/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setFlaggedComments(prev => prev.filter(c => c.comment_id !== commentId));
      } else {
        throw new Error(data.error || 'Failed to delete comment');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Dismiss flag from comment
  const handleDismissCommentFlag = async (commentId) => {
    if (!confirm('Remove flag from this comment?')) return;
    try {
      setProcessingId(commentId);
      const res = await fetch(`${API_BASE}/admin/comments/${commentId}/unflag`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setFlaggedComments(prev => prev.filter(c => c.comment_id !== commentId));
      } else {
        throw new Error(data.error || 'Failed to dismiss flag');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Delete resource
  const handleDeleteResource = async (resourceId) => {
    if (!confirm('Delete this resource permanently?')) return;
    try {
      setProcessingId(resourceId);
      const res = await fetch(`${API_BASE}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const data = await res.json();
      if (res.ok && data.status === 'ok') {
        setResources(prev => prev.filter(r => r.resource_id !== resourceId));
      } else {
        throw new Error(data.error || 'Failed to delete resource');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (!user || !(user.is_admin || user.isAdmin)) {
    return null;
  }

  if (loading) {
    return (
      <>
        <PageHeader />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <p className="text-gray-600">Loading admin dashboard...</p>
        </main>
      </>
    );
  }

  const sidebarItems = [
    { id: 'flaggedPosts', label: 'Review Flagged Posts', count: flaggedPosts.length },
    { id: 'flaggedComments', label: 'Review Flagged Comments', count: flaggedComments.length },
    { id: 'manageResources', label: 'Manage Resources', count: 0 }
  ];

  return (
    <>
      <PageHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Tasks</h3>
              </div>
              <nav className="p-2">
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition-colors flex items-center justify-between ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm">{item.label}</span>
                    {item.count > 0 && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activeSection === item.id
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Flagged Posts Section */}
              {activeSection === 'flaggedPosts' && (
                <motion.div
                  key="flaggedPosts"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Review Flagged Posts</h2>
                    <p className="text-gray-600 mt-1">
                      {flaggedPosts.length} post{flaggedPosts.length !== 1 ? 's' : ''} flagged for review
                    </p>
                  </div>

                  {flaggedPosts.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <Flag className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">No flagged posts to review</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {flaggedPosts.map(post => (
                        <motion.div
                          key={post.post_id}
                          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                          layout
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                                <span>{post.username}</span>
                                <span>•</span>
                                <span>{formatTimeSince(post.created_at)} ago</span>
                                <span>•</span>
                                <span className="text-red-600 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  Flagged {formatTimeSince(post.flagged_at)} ago
                                </span>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {post.topic}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeletePost(post.post_id)}
                              disabled={processingId === post.post_id}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                              {processingId === post.post_id ? 'Processing...' : 'Delete Post'}
                            </button>
                            <button
                              onClick={() => handleDismissPostFlag(post.post_id)}
                              disabled={processingId === post.post_id}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                            >
                              <XCircle className="h-4 w-4" />
                              Dismiss Flag
                            </button>
                            <button
                              onClick={() => navigate(`/viewpost/${post.post_id}`)}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              View Full Post
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Flagged Comments Section */}
              {activeSection === 'flaggedComments' && (
                <motion.div
                  key="flaggedComments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Review Flagged Comments</h2>
                    <p className="text-gray-600 mt-1">
                      {flaggedComments.length} comment{flaggedComments.length !== 1 ? 's' : ''} flagged for review
                    </p>
                  </div>

                  {flaggedComments.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                      <Flag className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">No flagged comments to review</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {flaggedComments.map(comment => (
                        <motion.div
                          key={comment.comment_id}
                          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                          layout
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="font-medium">{comment.username}</span>
                                <span>•</span>
                                <span>{formatTimeSince(comment.created_at)} ago</span>
                                <span>•</span>
                                <span className="text-red-600 flex items-center gap-1">
                                  <AlertCircle className="h-4 w-4" />
                                  Flagged {formatTimeSince(comment.flagged_at)} ago
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                On post: {comment.post_title}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-4">{comment.content}</p>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteComment(comment.comment_id)}
                              disabled={processingId === comment.comment_id}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                            >
                              <Trash2 className="h-4 w-4" />
                              {processingId === comment.comment_id ? 'Processing...' : 'Delete Comment'}
                            </button>
                            <button
                              onClick={() => handleDismissCommentFlag(comment.comment_id)}
                              disabled={processingId === comment.comment_id}
                              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                            >
                              <XCircle className="h-4 w-4" />
                              Dismiss Flag
                            </button>
                            <button
                              onClick={() => navigate(`/viewpost/${comment.post_id}`)}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                            >
                              View Post
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Manage Resources Section */}
              {activeSection === 'manageResources' && (
                <motion.div
                  key="manageResources"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Manage Resources</h2>
                      <p className="text-gray-600 mt-1">
                        {resources.length} resource{resources.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/addresource')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <span className="text-xl leading-none">+</span>
                      Add Resource
                    </button>
                  </div>

                  <div className="space-y-4">
                    {resources.map(resource => (
                      <motion.div
                        key={resource.resource_id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                        layout
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {resource.title}
                            </h3>
                            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                              {resource.description}
                            </p>
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Visit Resource
                              </a>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteResource(resource.resource_id)}
                            disabled={processingId === resource.resource_id}
                            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete resource"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </>
  );
}
