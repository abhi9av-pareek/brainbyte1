import mongoose from "mongoose";

/* ── Individual question result sub-schema ──
   Stores each question asked in the quiz and what the user answered  */
const questionResultSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true }, // the actual question
    options: { type: [String], default: [] }, // all 4 options shown to user
    correctAnswer: { type: String, required: true }, // the right answer
    userAnswer: { type: String, default: null }, // what user selected (null = skipped)
    isCorrect: { type: Boolean, required: true }, // true / false
    timeTaken: { type: Number, default: 0 }, // seconds spent on this question
    topic: { type: String, default: "" }, // sub-topic e.g. "Quadratic Equations"
    isBookmarked: { type: Boolean, default: false }, // user bookmarked during quiz
  },
  { _id: false }, // no separate _id per question
);

/* ── Main quiz attempt schema ── */
const quizSchema = new mongoose.Schema(
  {
    /* ── WHO took the quiz ── */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // index for fast user-based queries
    },

    /* ── QUIZ CONFIGURATION (mirrors QuizSetup selections) ── */
    subject: {
      type: String,
      required: true, // e.g. "Mathematics"
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true, // how many questions were in this quiz
    },
    timePerQuestion: {
      type: Number,
      required: true, // seconds allowed per question
    },
    options: {
      shuffle: { type: Boolean, default: false },
      hintsEnabled: { type: Boolean, default: false },
      instantFeedback: { type: Boolean, default: false },
      endReview: { type: Boolean, default: false },
    },

    /* ── RESULTS ── */
    questions: {
      type: [questionResultSchema],
      default: [], // full breakdown of every question
    },
    totalCorrect: {
      type: Number,
      default: 0, // number of correct answers
    },
    totalWrong: {
      type: Number,
      default: 0, // number of wrong answers
    },
    totalSkipped: {
      type: Number,
      default: 0, // questions left unanswered
    },
    scorePercent: {
      type: Number,
      default: 0, // 0–100, e.g. 85.5
    },

    /* ── XP EARNED in this quiz ── */
    xpEarned: {
      type: Number,
      default: 0,
      /*
        XP rules applied in quizController.js:
        scorePercent 90–100  → 100 XP
        scorePercent 75–89   → 75  XP
        scorePercent 60–74   → 50  XP
        scorePercent 40–59   → 30  XP
        scorePercent < 40    → 10  XP
        streak bonus         → +20 XP (added separately on user model)
      */
    },

    /* ── TIMING ── */
    timeTakenTotal: {
      type: Number,
      default: 0, // total seconds taken for entire quiz
    },
    completedAt: {
      type: Date,
      default: Date.now, // when quiz was submitted
    },

    /* ── WEAK TOPICS detected in this quiz ──
       Topics where user got less than 50% correct
       Controller compares these with user.weakTopics and updates them  */
    weakTopicsDetected: {
      type: [String],
      default: [], // e.g. ["Quadratic Equations", "Matrices"]
    },

    /* ── STATUS ── */
    status: {
      type: String,
      enum: ["completed", "abandoned"],
      default: "completed", // abandoned = user quit mid-quiz
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  },
);

/* ── VIRTUAL: accuracy for this specific quiz ── */
quizSchema.virtual("accuracy").get(function () {
  if (this.totalQuestions === 0) return 0;
  return Math.round((this.totalCorrect / this.totalQuestions) * 100);
});

/* ── VIRTUAL: result label based on score ── */
quizSchema.virtual("resultLabel").get(function () {
  if (this.scorePercent >= 90) return "Excellent";
  if (this.scorePercent >= 75) return "Good";
  if (this.scorePercent >= 60) return "Average";
  if (this.scorePercent >= 40) return "Below Average";
  return "Needs Improvement";
});

/* ── STATIC METHOD: calculate XP from score percent ──
   Call this as: Quiz.calculateXP(scorePercent)            */
quizSchema.statics.calculateXP = function (scorePercent) {
  if (scorePercent >= 90) return 100;
  if (scorePercent >= 75) return 75;
  if (scorePercent >= 60) return 50;
  if (scorePercent >= 40) return 30;
  return 10;
};

/* ── STATIC METHOD: detect weak topics from question results ──
   A topic is "weak" if user scored less than 50% on it in this quiz
   Call this as: Quiz.detectWeakTopics(questionsArray)              */
quizSchema.statics.detectWeakTopics = function (questions) {
  // Group questions by topic
  const topicMap = {};
  questions.forEach((q) => {
    if (!q.topic) return;
    if (!topicMap[q.topic]) topicMap[q.topic] = { correct: 0, total: 0 };
    topicMap[q.topic].total += 1;
    if (q.isCorrect) topicMap[q.topic].correct += 1;
  });

  // Return topics where accuracy < 50%
  const weakTopics = [];
  for (const [topic, data] of Object.entries(topicMap)) {
    const accuracy = (data.correct / data.total) * 100;
    if (accuracy < 50) weakTopics.push(topic);
  }
  return weakTopics;
};

/* ── STATIC METHOD: generate suggestion for a weak topic ──
   Returns a study suggestion string based on topic name
   Call this as: Quiz.getSuggestion(subject, topic)                 */
quizSchema.statics.getSuggestion = function (subject, topic) {
  return `Review core concepts of "${topic}" in ${subject}. Try solving 10 practice questions before your next attempt.`;
};

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
