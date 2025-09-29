import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();

function getUserIdFromReq(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  const scheme = parts[0];
  const token = parts[1];
  if (!/^Bearer$/i.test(scheme)) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload && (payload.id || payload.user_id || payload.userId) ? (payload.id || payload.user_id || payload.userId) : null;
  } catch (err) {
    return null;
  }
}

// GET /journal - list recent journal entries (public)
router.get('/', async (req, res) => {
  try {
    // Include latest mood (if any) from MoodCheckIns as `mood`
    const [rows] = await pool.query(
      `SELECT je.entry_id, je.user_id, je.title, je.content, je.created_at,
              (
                SELECT mood FROM MoodCheckIns mci WHERE mci.entry_id = je.entry_id ORDER BY mci.created_at DESC LIMIT 1
              ) AS mood
       FROM JournalEntries je
       ORDER BY je.created_at DESC
       LIMIT 200`
    );
    res.json({ status: 'ok', data: rows });
  } catch (err) {
    console.error('GET /journal error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// GET /journal/:id - single entry
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [rows] = await pool.query(
      `SELECT je.entry_id, je.user_id, je.title, je.content, je.created_at,
              (
                SELECT mood FROM MoodCheckIns mci WHERE mci.entry_id = je.entry_id ORDER BY mci.created_at DESC LIMIT 1
              ) AS mood
       FROM JournalEntries je
       WHERE je.entry_id = ?
       LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ status: 'error', error: 'Entry not found' });
    res.json({ status: 'ok', data: rows[0] });
  } catch (err) {
    console.error('GET /journal/:id error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// POST /journal - create a new journal entry (requires auth)
router.post('/', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ status: 'error', error: 'Unauthorized' });
    const { title, content } = req.body || {};
    if (!content) return res.status(400).json({ status: 'error', error: 'Content is required' });
    const trimmedTitle = title ? title.toString().slice(0,255) : null;
    const trimmedContent = content.toString();
    const [result] = await pool.query('INSERT INTO JournalEntries (user_id, title, content) VALUES (?, ?, ?)', [userId, trimmedTitle, trimmedContent]);
    const [rows] = await pool.query('SELECT entry_id, user_id, title, content, created_at FROM JournalEntries WHERE entry_id = ? LIMIT 1', [result.insertId]);
    res.status(201).json({ status: 'ok', data: rows[0] });
  } catch (err) {
    console.error('POST /journal error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// DELETE /journal/:id - delete an entry (owner or admin)
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const authPayload = (() => {
      const auth = req.headers.authorization || req.headers.Authorization;
      if (!auth) return null;
      try { return jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET); } catch(e) { return null; }
    })();
    const userId = authPayload && (authPayload.id || authPayload.user_id || authPayload.userId) ? (authPayload.id || authPayload.user_id || authPayload.userId) : null;
    const isAdmin = authPayload && (authPayload.is_admin === 1 || authPayload.is_admin === true);
    if (!userId && !isAdmin) return res.status(401).json({ status: 'error', error: 'Unauthorized' });

    const [rows] = await pool.query('SELECT entry_id, user_id FROM JournalEntries WHERE entry_id = ? LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ status: 'error', error: 'Entry not found' });
    const entry = rows[0];
    if (!isAdmin && entry.user_id !== Number(userId)) return res.status(403).json({ status: 'error', error: 'Forbidden' });

    // Remove dependent MoodCheckIns before deleting the parent entry to satisfy FK constraints.
    // Use a transaction to ensure consistency.
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM MoodCheckIns WHERE entry_id = ?', [id]);
      await conn.query('DELETE FROM JournalEntries WHERE entry_id = ?', [id]);
      await conn.commit();
      res.json({ status: 'ok', message: 'Entry deleted' });
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('DELETE /journal/:id error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

export default router;
