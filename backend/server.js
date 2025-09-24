// Main Express server entry point.
// Responsibilities:
// - Load environment variables
// - Configure global middleware (CORS, JSON parsing)
// - Mount feature routers (/auth, /posts, /resources)
// - Start the HTTP server

import dotenv from "dotenv";
dotenv.config(); // load .env
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import resourcesRoutes from "./routes/resources.js";
import { testConnection } from "./db.js";


const app = express();

// Allow cross-origin requests from the frontend dev server
app.use(cors());
// Parse JSON bodies on all incoming requests
app.use(express.json());

// Test the pooled connection once at startup
testConnection();

// Feature routes: each router handles a set of endpoints
// e.g. POST /auth/login, POST /auth/register
app.use("/auth", authRoutes);
// e.g. GET /posts/public, POST /posts/:id/like, comments, etc.
app.use("/posts", postsRoutes);
// e.g. GET /resources, POST /resources (admin), DELETE /resources/:id (admin)
app.use("/resources", resourcesRoutes);

// Example route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

// Start listening for incoming HTTP requests
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});