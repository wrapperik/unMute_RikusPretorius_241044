// Posts feature routes: handles public feed, view post, create post,
// likes, and comments. Some actions require a logged-in user.

import express from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

// Helper: extract user id from Authorization: Bearer <token>
// Returns null if header is missing or token is invalid.
function getUserIdFromReq(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length !== 2) return null;
  const scheme = parts[0];
  const token = parts[1];
  if (!/^Bearer$/i.test(scheme)) return null;
  try {
    // Log a short preview of the token (do not log full token in prod)
    console.log('getUserIdFromReq token preview:', token ? token.slice(0, 20) + '...' : '[none]');
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('getUserIdFromReq jwt payload:', payload);
    return payload && (payload.id || payload.user_id || payload.userId) ? (payload.id || payload.user_id || payload.userId) : null;
  } catch (err) {
    console.error('JWT verify error:', err && err.message);
    return null;
  }
}

// GET /posts/public - return recent public posts
// No auth needed. Joins with Users for username (if not anonymous).
router.get("/public", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.post_id, p.user_id, p.content, p.title, p.topic, p.is_anonymous, p.is_flagged, p.flagged_at, p.created_at,
              u.username
       FROM PublicPosts p
       LEFT JOIN users u ON u.user_id = p.user_id
       ORDER BY p.created_at DESC
       LIMIT 100`
    );

    const posts = rows.map(r => ({
  post_id: r.post_id,
  user_id: r.user_id,
      content: r.content,
      title: (r.title && r.title.toString().trim()) || (r.content ? r.content.toString().split('\n')[0].slice(0,255) : `Post ${r.post_id}`),
  username: r.username || null,
      topic: (r.topic && r.topic.toString() !== 'NULL') ? r.topic.toString().trim().replace(/\s+/g,' ') : 'Other',
      is_anonymous: !!r.is_anonymous,
      is_flagged: !!r.is_flagged,
      flagged_at: r.flagged_at,
      created_at: r.created_at,
    }));

    res.json({ status: "ok", data: posts });
  } catch (err) {
    console.error("GET /posts/public error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});


// GET /posts/:id - return a single post by ID
router.get('/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const [rows] = await pool.query(
      `SELECT p.post_id, p.user_id, p.content, p.title, p.topic, p.is_anonymous, p.is_flagged, p.flagged_at, p.created_at,
              u.username
       FROM PublicPosts p
       LEFT JOIN users u ON u.user_id = p.user_id
       WHERE p.post_id = ?
       LIMIT 1`,
      [postId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ status: "error", error: "Post not found" });
    }
    const r = rows[0];
    const post = {
      post_id: r.post_id,
      user_id: r.user_id,
      content: r.content,
      title: (r.title && r.title.toString().trim()) || (r.content ? r.content.toString().split('\n')[0].slice(0,255) : `Post ${r.post_id}`),
      username: r.username || null,
      topic: (r.topic && r.topic.toString() !== 'NULL') ? r.topic.toString().trim().replace(/\s+/g,' ') : 'Other',
      is_anonymous: !!r.is_anonymous,
      is_flagged: !!r.is_flagged,
      flagged_at: r.flagged_at,
      created_at: r.created_at,
    };
    res.json(post);
  } catch (err) {
    console.error("GET /posts/:id error:", err);
    res.status(500).json({ status: "error", error: err.message });
  }
});


// POST /posts - create a new post
// NOTE: This is currently using a placeholder user_id = 1.
// In a real app, you would read the user id from the JWT token.
router.post('/', async (req, res) => {
  try {
    const { title, topic, content, is_anonymous } = req.body;
    // TODO: Replace with actual user_id from auth/session
    const user_id = 1;
    if (!title || !topic || !content) {
      return res.status(400).json({ status: 'error', error: 'Missing required fields' });
    }
    const [result] = await pool.query(
      `INSERT INTO PublicPosts (user_id, title, topic, content, is_anonymous) VALUES (?, ?, ?, ?, ?)`,
      [user_id, title, topic, content, is_anonymous ? 1 : 0]
    );
    res.json({ status: 'ok', post_id: result.insertId });
  } catch (err) {
    console.error('POST /posts error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});


// POST /posts/:id/like - toggle like for the authenticated user
// Requires a valid Bearer token. First tries to insert a like; if it
// already exists (duplicate), deletes it to "unlike".
router.post('/:id/like', async (req, res) => {
  try {
    const postId = req.params.id;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    console.log('POST /posts/' + postId + '/like - Authorization header:', authHeader ? '[present]' : '[missing]');
    const userId = getUserIdFromReq(req);
    console.log('Parsed userId from token:', userId);
    if (!userId) return res.status(401).json({ status: 'error', error: 'Unauthorized' });

    // Check post exists
    const [postRows] = await pool.query('SELECT post_id FROM PublicPosts WHERE post_id = ?', [postId]);
    if (postRows.length === 0) return res.status(404).json({ status: 'error', error: 'Post not found' });

    // Try to insert like; if duplicate, remove (toggle)
    try {
      const [ins] = await pool.query(
        'INSERT INTO PostLikes (post_id, user_id) VALUES (?, ?)',
        [postId, userId]
      );
      console.log('Inserted PostLikes id:', ins.insertId);
      // inserted
      return res.json({ status: 'ok', action: 'liked', like_id: ins.insertId });
    } catch (err) {
      console.error('Insert into PostLikes error code:', err && err.code, err && err.message);
      // If duplicate entry, remove existing like (toggle off)
      if (err && err.code === 'ER_DUP_ENTRY') {
        await pool.query('DELETE FROM PostLikes WHERE post_id = ? AND user_id = ?', [postId, userId]);
        console.log('Deleted existing PostLikes for', postId, userId);
        return res.json({ status: 'ok', action: 'unliked' });
      }
      throw err;
    }
  } catch (err) {
    console.error('POST /posts/:id/like error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});


// GET /posts/:id/likes - return like count and whether current user liked it
// If a token is provided, checks if that user has liked the post.
router.get('/:id/likes', async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = getUserIdFromReq(req); // may be null

    const [[{ count }]] = await pool.query(
      'SELECT COUNT(*) as count FROM PostLikes WHERE post_id = ?',
      [postId]
    ).then(r => [r[0]]);

    let liked_by_user = false;
    if (userId) {
      const [rows] = await pool.query('SELECT 1 FROM PostLikes WHERE post_id = ? AND user_id = ? LIMIT 1', [postId, userId]);
      liked_by_user = rows.length > 0;
    }

    res.json({ status: 'ok', data: { count: Number(count || 0), liked_by_user } });
  } catch (err) {
    console.error('GET /posts/:id/likes error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});


// GET /posts/:id/likers - list users who liked the post (basic info)
router.get('/:id/likers', async (req, res) => {
  try {
    const postId = req.params.id;
    const [rows] = await pool.query(
      `SELECT l.user_id, u.username, l.created_at
       FROM PostLikes l
       LEFT JOIN users u ON u.user_id = l.user_id
       WHERE l.post_id = ?
       ORDER BY l.created_at DESC
       LIMIT 100`,
      [postId]
    );
    res.json({ status: 'ok', data: rows });
  } catch (err) {
    console.error('GET /posts/:id/likers error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// --------------------
// COMMENTS endpoints
// --------------------

// Helper to get decoded token payload (may include is_admin)
function getPayloadFromReq(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  const token = parts[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// GET /posts/:id/comments - list comments for a post
// Public endpoint. Shows all comments in chronological order.
router.get('/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    // Ensure post exists
    const [postRows] = await pool.query('SELECT post_id FROM PublicPosts WHERE post_id = ? LIMIT 1', [postId]);
    if (postRows.length === 0) return res.status(404).json({ status: 'error', error: 'Post not found' });

    const [rows] = await pool.query(
      `SELECT c.comment_id, c.post_id, c.user_id, c.content, c.is_flagged, c.flagged_at, c.created_at, u.username
       FROM comments c
       LEFT JOIN users u ON u.user_id = c.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );
    res.json({ status: 'ok', data: rows });
  } catch (err) {
    console.error('GET /posts/:id/comments error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// POST /posts/:id/comments - create a new comment
// Auth optional: if no token provided, user_id is stored as NULL (anonymous).
router.post('/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body || {};
    if (!content || !content.toString().trim()) return res.status(400).json({ status: 'error', error: 'Content is required' });
    const trimmed = content.toString().slice(0, 1000);

    // Check post exists
    const [postRows] = await pool.query('SELECT post_id FROM PublicPosts WHERE post_id = ? LIMIT 1', [postId]);
    if (postRows.length === 0) return res.status(404).json({ status: 'error', error: 'Post not found' });

    const userId = getUserIdFromReq(req); // may be null
    const [result] = await pool.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId || null, trimmed]
    );
    const [rows] = await pool.query('SELECT comment_id, post_id, user_id, content, is_flagged, flagged_at, created_at FROM comments WHERE comment_id = ? LIMIT 1', [result.insertId]);
    res.status(201).json({ status: 'ok', data: rows[0] });
  } catch (err) {
    console.error('POST /posts/:id/comments error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// DELETE /posts/:postId/comments/:commentId - delete a comment (owner or admin)
// Requires auth. Only the comment's author or an admin can delete.
router.delete('/:postId/comments/:commentId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const payload = getPayloadFromReq(req);
    const userId = payload && (payload.id || payload.user_id || payload.userId) ? (payload.id || payload.user_id || payload.userId) : null;
    const isAdmin = payload && (payload.is_admin === 1 || payload.is_admin === true);

    if (!userId && !isAdmin) return res.status(401).json({ status: 'error', error: 'Unauthorized' });

    const [rows] = await pool.query('SELECT comment_id, user_id FROM comments WHERE comment_id = ? AND post_id = ? LIMIT 1', [commentId, postId]);
    if (rows.length === 0) return res.status(404).json({ status: 'error', error: 'Comment not found' });

    const comment = rows[0];
    if (!isAdmin && comment.user_id !== Number(userId)) {
      return res.status(403).json({ status: 'error', error: 'Forbidden' });
    }

    await pool.query('DELETE FROM comments WHERE comment_id = ? AND post_id = ?', [commentId, postId]);
    res.json({ status: 'ok', message: 'Comment deleted' });
  } catch (err) {
    console.error('DELETE /posts/:postId/comments/:commentId error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// POST /posts/:postId/comments/:commentId/flag - flag a comment for moderation
// Requires auth. Sets is_flagged = 1 and records flagged_at timestamp.
router.post('/:postId/comments/:commentId/flag', async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const payload = getPayloadFromReq(req);
    const userId = payload && (payload.id || payload.user_id || payload.userId) ? (payload.id || payload.user_id || payload.userId) : null;

    if (!userId) return res.status(401).json({ status: 'error', error: 'Unauthorized' });

    const [rows] = await pool.query('SELECT comment_id FROM comments WHERE comment_id = ? AND post_id = ? LIMIT 1', [commentId, postId]);
    if (rows.length === 0) return res.status(404).json({ status: 'error', error: 'Comment not found' });

    await pool.query('UPDATE comments SET is_flagged = 1, flagged_at = NOW() WHERE comment_id = ? AND post_id = ?', [commentId, postId]);
    res.json({ status: 'ok', message: 'Comment flagged' });
  } catch (err) {
    console.error('POST /posts/:postId/comments/:commentId/flag error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// POST /posts/:id/flag - flag a post for moderation
// Requires auth. Sets is_flagged = 1 and records flagged_at timestamp.
router.post('/:id/flag', async (req, res) => {
  try {
    const postId = req.params.id;
    const payload = getPayloadFromReq(req);
    const userId = payload && (payload.id || payload.user_id || payload.userId) ? (payload.id || payload.user_id || payload.userId) : null;

    if (!userId) return res.status(401).json({ status: 'error', error: 'Unauthorized' });

    const [rows] = await pool.query('SELECT post_id FROM PublicPosts WHERE post_id = ? LIMIT 1', [postId]);
    if (rows.length === 0) return res.status(404).json({ status: 'error', error: 'Post not found' });

    await pool.query('UPDATE PublicPosts SET is_flagged = 1, flagged_at = NOW() WHERE post_id = ?', [postId]);
    res.json({ status: 'ok', message: 'Post flagged' });
  } catch (err) {
    console.error('POST /posts/:id/flag error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const payload = getPayloadFromReq(req);
    const userId = payload && (payload.id || payload.user_id || payload.userId) ? (payload.id || payload.user_id || payload.userId) : null;
    const isAdmin = payload && (payload.is_admin === 1 || payload.is_admin === true);

    if (!userId && !isAdmin) return res.status(401).json({ status: 'error', error: 'Unauthorized' });

    // Fetch the post
    const [rows] = await pool.query('SELECT post_id, user_id FROM PublicPosts WHERE post_id = ? LIMIT 1', [postId]);
    if (rows.length === 0) return res.status(404).json({ status: 'error', error: 'Post not found' });

    const post = rows[0];
    if (!isAdmin && post.user_id !== Number(userId)) {
      return res.status(403).json({ status: 'error', error: 'Forbidden' });
    }

    await pool.query('DELETE FROM PublicPosts WHERE post_id = ?', [postId]);
    res.json({ status: 'ok', message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

export default router; // mounted under /posts in server.js

