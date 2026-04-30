import dotenv from "dotenv";
const app = express();

import cors from "cors";
import express from "express";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";
dotenv.config();

// logging middleware
app.use((req, res, next) => {
  console.log("Request hit:", req.method, req.url);
  next();
});

// connect DB
connectDB();

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use("/api/quiz", quizRoutes);
app.use("/api/auth", authRoutes);

// root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// start server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
