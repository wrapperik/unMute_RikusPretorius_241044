// User profile management routes
// Handles getting and updating user profile information

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ status: "error", error: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ status: "error", error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// GET /user/profile - Get current user's profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT user_id, email, username, is_admin, profile_picture FROM users WHERE user_id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: "error", error: "User not found" });
    }

    const user = rows[0];
    res.json({
      status: "ok",
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        is_admin: user.is_admin,
        profilePicture: user.profile_picture || null
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// PUT /user/profile - Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  const { username, email } = req.body;
  
  try {
    // Check if username is already taken by another user
    if (username) {
      const [existing] = await pool.query(
        "SELECT user_id FROM users WHERE username = ? AND user_id != ?",
        [username, req.user.id]
      );
      if (existing.length > 0) {
        return res.status(409).json({ status: "error", error: "Username already taken" });
      }
    }

    // Check if email is already taken by another user
    if (email) {
      const [existingEmail] = await pool.query(
        "SELECT user_id FROM users WHERE email = ? AND user_id != ?",
        [email, req.user.id]
      );
      if (existingEmail.length > 0) {
        return res.status(409).json({ status: "error", error: "Email already registered" });
      }
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];

    if (username !== undefined) {
      updates.push("username = ?");
      values.push(username);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({ status: "error", error: "No fields to update" });
    }

    values.push(req.user.id);
    await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE user_id = ?`,
      values
    );

    // Fetch updated user data
    const [rows] = await pool.query(
      "SELECT user_id, email, username, is_admin, profile_picture FROM users WHERE user_id = ?",
      [req.user.id]
    );

    const user = rows[0];
    res.json({
      status: "ok",
      message: "Profile updated successfully",
      user: {
        id: user.user_id,
        email: user.email,
        username: user.username,
        is_admin: user.is_admin,
        profilePicture: user.profile_picture || null
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// PUT /user/password - Change password
router.put("/password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ status: "error", error: "Current and new password required" });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ status: "error", error: "New password must be at least 6 characters" });
  }

  try {
    // Get current password hash
    const [rows] = await pool.query(
      "SELECT password FROM users WHERE user_id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: "error", error: "User not found" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) {
      return res.status(400).json({ status: "error", error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      "UPDATE users SET password = ? WHERE user_id = ?",
      [hashedPassword, req.user.id]
    );

    res.json({
      status: "ok",
      message: "Password updated successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

// DELETE /user/account - Delete user account
router.delete("/account", authenticateToken, async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ status: "error", error: "Password required to delete account" });
  }

  try {
    // Verify password
    const [rows] = await pool.query(
      "SELECT password FROM users WHERE user_id = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ status: "error", error: "User not found" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ status: "error", error: "Incorrect password" });
    }

    // Delete user account (cascade should handle related records)
    await pool.query("DELETE FROM users WHERE user_id = ?", [req.user.id]);

    res.json({
      status: "ok",
      message: "Account deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", error: err.message });
  }
});

export default router;
