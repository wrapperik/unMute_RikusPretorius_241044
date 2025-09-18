
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import authRoutes from "./routes/auth.js";


const app = express();
app.use(cors());
app.use(express.json());
// Support both /auth and /api/auth for frontend compatibility
app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);

// Setup DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Test DB
db.connect(err => {
  if (err) {
    console.error("DB Connection failed:", err);
  } else {
    console.log("Connected to MySQL ✅");
  }
});

// Example route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running 🚀" });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});