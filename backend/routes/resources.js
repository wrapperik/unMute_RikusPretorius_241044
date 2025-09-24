import express from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();

// Helper: parse token payload
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

// GET /resources - list latest resources
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT resource_id, title, url, description, created_at FROM Resources ORDER BY created_at DESC LIMIT 200'
    );
    res.json({ status: 'ok', data: rows });
  } catch (err) {
    console.error('GET /resources error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// POST /resources - create a resource (admin only)
router.post('/', async (req, res) => {
  try {
    const payload = getPayloadFromReq(req);
    const isAdmin = payload && (payload.is_admin === 1 || payload.is_admin === true);
    if (!isAdmin) return res.status(403).json({ status: 'error', error: 'Forbidden' });

    const { title, url, description } = req.body || {};
    if (!title || !title.toString().trim()) return res.status(400).json({ status: 'error', error: 'Title is required' });
    if (!description || !description.toString().trim()) return res.status(400).json({ status: 'error', error: 'Description is required' });

    const t = title.toString().slice(0, 255);
    const u = url ? url.toString().slice(0, 255) : null;
    const d = description.toString().slice(0, 20000);

    const [result] = await pool.query(
      'INSERT INTO Resources (title, url, description) VALUES (?, ?, ?)',
      [t, u, d]
    );

    const [rows] = await pool.query('SELECT resource_id, title, url, description, created_at FROM Resources WHERE resource_id = ? LIMIT 1', [result.insertId]);
    res.status(201).json({ status: 'ok', data: rows[0] });
  } catch (err) {
    console.error('POST /resources error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// DELETE /resources/:id - hard delete (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const payload = getPayloadFromReq(req);
    const isAdmin = payload && (payload.is_admin === 1 || payload.is_admin === true);
    if (!isAdmin) return res.status(403).json({ status: 'error', error: 'Forbidden' });

    const id = req.params.id;
    const [rows] = await pool.query('SELECT resource_id FROM Resources WHERE resource_id = ? LIMIT 1', [id]);
    if (rows.length === 0) return res.status(404).json({ status: 'error', error: 'Resource not found' });

    await pool.query('DELETE FROM Resources WHERE resource_id = ?', [id]);
    res.json({ status: 'ok', message: 'Resource deleted' });
  } catch (err) {
    console.error('DELETE /resources/:id error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

export default router;
