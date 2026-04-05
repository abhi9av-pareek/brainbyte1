import express from "express";

import { generateQuestions } from "../controllers/questionController.js";
import {
  submitQuiz,
  getDashboardData,
  getWeakTopics,
  addBookmark,
  updateBookmarkNotes,
  removeBookmark,
  getBookmarks,
  getQuizHistory,
} from "../controllers/quizController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate-questions", verifyToken, generateQuestions);
router.post("/submit",             verifyToken, submitQuiz);
router.get("/history",             verifyToken, getQuizHistory);
router.get("/dashboard",           verifyToken, getDashboardData);
router.get("/weak-topics",         verifyToken, getWeakTopics);
router.get("/bookmarks",           verifyToken, getBookmarks);
router.post("/bookmark",           verifyToken, addBookmark);
router.patch("/bookmark/:questionId",  verifyToken, updateBookmarkNotes);
router.delete("/bookmark/:questionId", verifyToken, removeBookmark);

export default router;
