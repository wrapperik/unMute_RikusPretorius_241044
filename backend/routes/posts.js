import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET /posts/public - return recent public posts
router.get("/public", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.post_id, p.user_id, p.content, p.title, p.topic, p.is_anonymous, p.is_flagged, p.flagged_at, p.created_at,
              u.username
       FROM PublicPosts p
       LEFT JOIN Users u ON u.user_id = p.user_id
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
       LEFT JOIN Users u ON u.user_id = p.user_id
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

export default router;
