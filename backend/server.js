// Main Express server entry point.
// Responsibilities:
// - Load environment variables
// - Configure global middleware (CORS, JSON parsing)
// - Mount feature routers (/auth, /posts, /resources)
// - Start the HTTP server

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '.env') });

import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import resourcesRoutes from "./routes/resources.js";
import journalRoutes from "./routes/journal.js";
import moodCheckinsRoutes from "./routes/moodcheckins.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.js";
import { testConnection } from "./db.js";


const app = express();

// Allow cross-origin requests from the frontend dev server
app.use(cors());
// Parse JSON bodies on all incoming requests
app.use(express.json());

// Support frontend using `/api/...` paths by removing the `/api` prefix.
// Some frontend calls use `/api/auth/login` etc. The backend routes are
// mounted at `/auth`, `/posts` etc. Stripping `/api` here keeps the
// frontend code unchanged while making the paths match the server routes.
app.use((req, res, next) => {
  if (req.path && req.path.startsWith('/api/')) {
    // rewrite url so downstream routers see the path without /api
    req.url = req.url.replace(/^\/api/, '');
  }
  next();
});

// Test the pooled connection once at startup
testConnection();

// Feature routes: each router handles a set of endpoints
// e.g. POST /auth/login, POST /auth/register
app.use("/auth", authRoutes);
// e.g. GET /posts/public, POST /posts/:id/like, comments, etc.
app.use("/posts", postsRoutes);
// e.g. GET /resources, POST /resources (admin), DELETE /resources/:id (admin)
app.use("/resources", resourcesRoutes);
// Journal entries endpoints (GET/POST/DELETE)
app.use("/journal", journalRoutes);
// Backwards-compatible alias: some frontend paths expect /addentry
app.use("/addentry", journalRoutes);
// Mood check-ins (POST creating check-ins tied to journal entries)
app.use("/moodcheckins", moodCheckinsRoutes);
// Admin endpoints (flagged content management) - admin only
app.use("/admin", adminRoutes);
// User profile management endpoints
app.use("/user", userRoutes);

// In production, serve the built frontend from the Vite build output
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(process.cwd(), "Frontend", "unMute", "dist");
  app.use(express.static(staticPath));

  // SPA fallback: return index.html for any request that doesn't match an API route
  // This allows client-side routing to work (React Router, etc.)
  app.use((req, res, next) => {
    // Check if it's an API route
    if (req.path.startsWith('/auth') || req.path.startsWith('/posts') || 
        req.path.startsWith('/resources') || req.path.startsWith('/journal') || 
        req.path.startsWith('/addentry') || req.path.startsWith('/moodcheckins') || 
        req.path.startsWith('/admin') || req.path.startsWith('/user')) {
      return next(); // Let API routes pass through
    }
    // Serve index.html for all other routes (SPA fallback)
    res.sendFile(path.join(staticPath, "index.html"));
  });
} else {
  // Development mode: show a simple API status message
  app.get("/", (req, res) => {
    res.json({ message: "Backend is running 🚀 (Development mode)" });
  });
}

// Start listening for incoming HTTP requests
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Global Express error handler - logs error details and returns a generic 500 to clients.
// This will catch errors passed to next(err) and any errors routed here by async wrappers.
app.use((err, req, res, next) => {
  try {
    console.error('Unhandled error in request:', err && (err.stack || err));
  } catch (logErr) {
    console.error('Error while logging an error:', logErr);
  }
  // Send minimal error info to client to avoid leaking internals
  res.status(500).json({ status: 'error', error: err && err.message ? err.message : 'Internal server error' });
});

// Process-level handlers so crashes and unhandled promise rejections show up clearly in the terminal.
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err && (err.stack || err));
  // Depending on the app requirements you may want to exit the process here.
});