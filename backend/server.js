import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import postsRoutes from "./routes/posts.js";
import resourcesRoutes from "./routes/resources.js";
import { testConnection } from "./db.js";


const app = express();
app.use(cors());
app.use(express.json());

// Test the pooled connection once at startup
testConnection();

// Support /auth route
app.use("/auth", authRoutes);
// Support /posts route
app.use("/posts", postsRoutes);
// Support /resources route
app.use("/resources", resourcesRoutes);

// Example route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

app.listen(5050, () => {
  console.log("Server running on port 5050");
});