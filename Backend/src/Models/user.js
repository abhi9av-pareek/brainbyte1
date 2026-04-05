import mongoose from "mongoose";

/* ── Bookmark sub-schema ── */
const bookmarkSchema = new mongoose.Schema(
  {
    questionId: { type: String }, // reference to question
    subject: { type: String }, // e.g. "Mathematics"
    topic: { type: String }, // e.g. "Quadratic Equations"
    questionText: { type: String }, // actual question text
    notes: { type: String, default: "" }, // user's own notes
  },
  { timestamps: true }, // createdAt tells when bookmarked
);

/* ── Weak topic sub-schema ── */
const weakTopicSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true }, // e.g. "Physics"
    topic: { type: String, required: true }, // e.g. "Electromagnetism"
    avgScore: { type: Number, default: 0 }, // 0–100, recalculated after each quiz
    attempts: { type: Number, default: 0 }, // how many times attempted
    suggestion: { type: String, default: "" }, // e.g. "Revise Faraday's Law"
  },
  { _id: false }, // no separate _id needed
);

/* ── Main user schema ── */
const userSchema = new mongoose.Schema(
  {
    /* ── EXISTING FIELDS (unchanged) ── */
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    educationLevel: {
      type: String,
      required: true,
    },

    /* ── XP & STREAK ── */
    xp: {
      type: Number,
      default: 0, // starts at 0, increases after each quiz
    },
    streak: {
      type: Number,
      default: 0, // number of consecutive active days
    },
    lastActiveDate: {
      type: Date,
      default: null, // updated every time user submits a quiz
    },

    /* ── ACCURACY (rolling average) ── */
    totalQuestionsAttempted: {
      type: Number,
      default: 0, // cumulative questions answered
    },
    totalCorrect: {
      type: Number,
      default: 0, // cumulative correct answers
    },

    /* ── RANK ── */
    rank: {
      type: Number,
      default: null, // calculated server-side by sorting all users by XP
    },

    /* ── USER PREFERENCES ── */
    preferences: {
      subjects: {
        type: [String],
        default: [], // e.g. ["Mathematics", "Physics", "Biology"]
      },
      defaultDifficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Medium",
      },
    },

    /* ── WEAK TOPICS ── */
    weakTopics: {
      type: [weakTopicSchema],
      default: [], // populated/updated after each quiz result
    },

    /* ── BOOKMARKS ── */
    bookmarks: {
      type: [bookmarkSchema],
      default: [], // user bookmarks questions during/after quiz
    },
  },
  {
    timestamps: true, // createdAt, updatedAt (existing)
  },
);

/* ── VIRTUAL: accuracy percentage ──
   Computed on the fly from totalCorrect / totalQuestionsAttempted
   No need to store separately — always stays in sync               */
userSchema.virtual("accuracy").get(function () {
  if (this.totalQuestionsAttempted === 0) return 0;
  return Math.round((this.totalCorrect / this.totalQuestionsAttempted) * 100);
});

/* ── VIRTUAL: XP level label ──
   Gives the user a title based on XP range                        */
userSchema.virtual("level").get(function () {
  if (this.xp >= 10000) return "Legend";
  if (this.xp >= 5000) return "Expert";
  if (this.xp >= 2000) return "Intermediate";
  if (this.xp >= 500) return "Beginner";
  return "Newcomer";
});

/* ── XP RULES (reference for quizController.js) ──
   Score 90–100%  → +100 XP
   Score 75–89%   → +75  XP
   Score 60–74%   → +50  XP
   Score 40–59%   → +30  XP
   Score below 40%→ +10  XP
   Streak bonus   → +20  XP per active day                         */

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
