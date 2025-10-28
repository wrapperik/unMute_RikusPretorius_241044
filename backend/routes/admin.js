// Admin routes: manage flagged content, resources, and contact form submissions.
// All endpoints require admin authentication (is_admin = 1 in JWT).

import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();

// Helper: parse token payload from Authorization header.
// Returns decoded payload or null if missing/invalid.
function getPayloadFromReq(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  try {
    return jwt.verify(parts[1], process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Middleware: verify admin status
function requireAdmin(req, res, next) {
  const payload = getPayloadFromReq(req);
  const isAdmin = payload && (payload.is_admin === 1 || payload.is_admin === true);
  if (!isAdmin) {
    return res.status(403).json({ status: 'error', error: 'Admin access required' });
  }
  req.adminPayload = payload;
  next();
}

// GET /admin/flagged-posts - list all flagged posts
router.get('/flagged-posts', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.post_id, p.user_id, p.content, p.title, p.topic, p.is_anonymous, p.is_flagged, p.flagged_at, p.created_at,
              u.username
       FROM PublicPosts p
       LEFT JOIN users u ON u.user_id = p.user_id
       WHERE p.is_flagged = 1
       ORDER BY p.flagged_at DESC
       LIMIT 200`
    );

    const posts = rows.map(r => ({
      post_id: r.post_id,
      user_id: r.user_id,
      content: r.content,
      title: (r.title && r.title.toString().trim()) || (r.content ? r.content.toString().split('\n')[0].slice(0,255) : `Post ${r.post_id}`),
      username: r.username || 'Anonymous',
      topic: (r.topic && r.topic.toString() !== 'NULL') ? r.topic.toString().trim().replace(/\s+/g,' ') : 'Other',
      is_anonymous: !!r.is_anonymous,
      is_flagged: !!r.is_flagged,
      flagged_at: r.flagged_at,
      created_at: r.created_at,
    }));

    res.json({ status: 'ok', data: posts });
  } catch (err) {
    console.error('GET /admin/flagged-posts error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET /admin/flagged-comments - list all flagged comments
router.get('/flagged-comments', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.comment_id, c.post_id, c.user_id, c.content, c.is_flagged, c.flagged_at, c.created_at,
              u.username, p.title as post_title
       FROM comments c
       LEFT JOIN users u ON u.user_id = c.user_id
       LEFT JOIN PublicPosts p ON p.post_id = c.post_id
       WHERE c.is_flagged = 1
       ORDER BY c.flagged_at DESC
       LIMIT 200`
    );

    const comments = rows.map(r => ({
      comment_id: r.comment_id,
      post_id: r.post_id,
      user_id: r.user_id,
      content: r.content,
      username: r.username || 'Anonymous',
      post_title: r.post_title || `Post ${r.post_id}`,
      is_flagged: !!r.is_flagged,
      flagged_at: r.flagged_at,
      created_at: r.created_at,
    }));

    res.json({ status: 'ok', data: comments });
  } catch (err) {
    console.error('GET /admin/flagged-comments error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// DELETE /admin/posts/:id - delete a flagged post (admin only)
router.delete('/posts/:id', requireAdmin, async (req, res) => {
  try {
    const postId = req.params.id;
    const [rows] = await pool.query('SELECT post_id FROM PublicPosts WHERE post_id = ? LIMIT 1', [postId]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'Post not found' });
    }

    await pool.query('DELETE FROM PublicPosts WHERE post_id = ?', [postId]);
    res.json({ status: 'ok', message: 'Post deleted successfully' });
  } catch (err) {
    console.error('DELETE /admin/posts/:id error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// DELETE /admin/comments/:id - delete a flagged comment (admin only)
router.delete('/comments/:id', requireAdmin, async (req, res) => {
  try {
    const commentId = req.params.id;
    const [rows] = await pool.query('SELECT comment_id FROM comments WHERE comment_id = ? LIMIT 1', [commentId]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'Comment not found' });
    }

    await pool.query('DELETE FROM comments WHERE comment_id = ?', [commentId]);
    res.json({ status: 'ok', message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('DELETE /admin/comments/:id error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// POST /admin/posts/:id/unflag - unflag a post (admin only)
router.post('/posts/:id/unflag', requireAdmin, async (req, res) => {
  try {
    const postId = req.params.id;
    const [rows] = await pool.query('SELECT post_id FROM PublicPosts WHERE post_id = ? LIMIT 1', [postId]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'Post not found' });
    }

    await pool.query('UPDATE PublicPosts SET is_flagged = 0, flagged_at = NULL WHERE post_id = ?', [postId]);
    res.json({ status: 'ok', message: 'Post unflagged successfully' });
  } catch (err) {
    console.error('POST /admin/posts/:id/unflag error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// POST /admin/comments/:id/unflag - unflag a comment (admin only)
router.post('/comments/:id/unflag', requireAdmin, async (req, res) => {
  try {
    const commentId = req.params.id;
    const [rows] = await pool.query('SELECT comment_id FROM comments WHERE comment_id = ? LIMIT 1', [commentId]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'Comment not found' });
    }

    await pool.query('UPDATE comments SET is_flagged = 0, flagged_at = NULL WHERE comment_id = ?', [commentId]);
    res.json({ status: 'ok', message: 'Comment unflagged successfully' });
  } catch (err) {
    console.error('POST /admin/comments/:id/unflag error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET /admin/users - list all users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, username, email, profile_picture, is_admin
       FROM users
       ORDER BY user_id DESC`
    );

    const users = rows.map(r => ({
      user_id: r.user_id,
      username: r.username,
      email: r.email,
      profile_picture: r.profile_picture,
      is_admin: !!r.is_admin,
    }));

    res.json({ status: 'ok', data: users });
  } catch (err) {
    console.error('GET /admin/users error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// DELETE /admin/users/:id - delete a user (admin only)
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent self-deletion
    if (req.adminPayload.user_id === parseInt(userId)) {
      return res.status(400).json({ status: 'error', error: 'Cannot delete your own account' });
    }

    const [rows] = await pool.query('SELECT user_id FROM users WHERE user_id = ? LIMIT 1', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }

    await pool.query('DELETE FROM users WHERE user_id = ?', [userId]);
    res.json({ status: 'ok', message: 'User deleted successfully' });
  } catch (err) {
    console.error('DELETE /admin/users/:id error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// POST /admin/users/:id/toggle-admin - toggle admin status (admin only)
router.post('/users/:id/toggle-admin', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    const [rows] = await pool.query('SELECT user_id, is_admin FROM users WHERE user_id = ? LIMIT 1', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', error: 'User not found' });
    }

    const newAdminStatus = rows[0].is_admin ? 0 : 1;
    await pool.query('UPDATE users SET is_admin = ? WHERE user_id = ?', [newAdminStatus, userId]);
    
    res.json({ 
      status: 'ok', 
      message: `User ${newAdminStatus ? 'granted' : 'revoked'} admin status`,
      is_admin: !!newAdminStatus
    });
  } catch (err) {
    console.error('POST /admin/users/:id/toggle-admin error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

export default router; // mounted under /admin in server.js
