import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// GET /posts/public - return recent public posts
router.get("/public", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT post_id, user_id, content, title, topic, is_anonymous, is_flagged, flagged_at, created_at
       FROM PublicPosts
       ORDER BY created_at DESC
       LIMIT 100`
    );

    const posts = rows.map(r => ({
      post_id: r.post_id,
      user_id: r.user_id,
      content: r.content,
      title: (r.title && r.title.toString().trim()) || (r.content ? r.content.toString().split('\n')[0].slice(0,255) : `Post ${r.post_id}`),
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

export default router;
