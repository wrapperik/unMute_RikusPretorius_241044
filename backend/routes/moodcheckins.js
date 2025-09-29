import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();

function getUserIdFromReq(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload && (payload.id || payload.user_id || payload.userId) ? (payload.id || payload.user_id || payload.userId) : null;
  } catch (err) {
    return null;
  }
}

// POST /moodcheckins - create a mood check-in for a journal entry (auth required)
router.post('/', async (req, res) => {
  try {
    const userId = getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ status: 'error', error: 'Unauthorized' });

    const { entry_id, mood } = req.body || {};
    if (!entry_id || !mood) return res.status(400).json({ status: 'error', error: 'entry_id and mood are required' });

    // Ensure entry exists
    const [entryRows] = await pool.query('SELECT entry_id FROM JournalEntries WHERE entry_id = ? LIMIT 1', [entry_id]);
    if (entryRows.length === 0) return res.status(404).json({ status: 'error', error: 'Journal entry not found' });

    const [result] = await pool.query('INSERT INTO MoodCheckIns (user_id, entry_id, mood) VALUES (?, ?, ?)', [userId, entry_id, mood]);
    const [rows] = await pool.query('SELECT checkin_id, user_id, entry_id, mood, created_at FROM MoodCheckIns WHERE checkin_id = ? LIMIT 1', [result.insertId]);
    res.status(201).json({ status: 'ok', data: rows[0] });
  } catch (err) {
    console.error('POST /moodcheckins error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

export default router;
