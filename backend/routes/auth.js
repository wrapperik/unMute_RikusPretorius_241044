import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

// Uses shared pool from db.js

// REGISTER
router.post("/register", async (req, res) => {
  const { email, username, password, is_admin } = req.body;
  if (!email || !password) {
    return res.status(400).json({ status: "error", error: "Email and password are required" });
  }
  try {
    // Check if user exists
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ status: "error", error: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (email, username, password, is_admin) VALUES (?, ?, ?, ?)",
      [email, username || null, hashed, is_admin || 0]
    );
    res.status(201).json({ status: "ok", message: "User registered", userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or username
  if (!identifier || !password) {
    return res.status(400).json({ status: "error", error: "Identifier and password required" });
  }
  const isEmail = identifier.includes("@");
  const field = isEmail ? "email" : "username";
  try {
    const [rows] = await pool.query(`SELECT * FROM users WHERE ${field} = ?`, [identifier]);
    if (rows.length === 0) return res.status(400).json({ status: "error", error: "User not found" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ status: "error", error: "Invalid credentials" });

    // Normalize user id 
    const uid = user.id || user.user_id || user.userId;
    const token = jwt.sign(
      { id: uid, is_admin: user.is_admin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      status: "ok",
      token,
      user: {
        id: uid,
        email: user.email,
        username: user.username,
        is_admin: user.is_admin,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});


export default router;