import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";

dotenv.config();

const app = express();

// logging middleware
app.use((req, res, next) => {
  console.log("Request hit:", req.method, req.url);
  next();
});

// connect DB
connectDB();

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://brainbytee.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());

// routes
app.use("/api/quiz", quizRoutes);
app.use("/api/auth", authRoutes);

// root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ message: "Server Error" });
});

// start server
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
